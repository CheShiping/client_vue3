import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import knowledgeText from '../data/oral_defence_sys_knowledge_base.txt?raw';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages"; // 添加 SystemMessage 导入

class Bot {
  questions: string[] = [];
  retriever!: VectorStoreRetriever<MemoryVectorStore>;
  systemPrompt!: string; // 改名为 systemPrompt
  ragChain!: RunnableSequence<any, string>;
  streamingRagChain: any; // 专门用于流式处理的链
  chatModel: ChatOpenAI;
  isInitialized: boolean = false; // 添加初始化状态标志

  constructor() {
    // 初始化 ChatOpenAI 客户端，配置为硅基流动服务
    this.chatModel = new ChatOpenAI({
      configuration: {
        apiKey: import.meta.env.VITE_SILICONFLOW_API_KEY || "sk----", // 替换为实际 API Key
        baseURL: "https://api.siliconflow.cn/v1",
      },
      model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B", // 指定使用的模型
    });
  }

  // 初始化向量存储
  async initVector() {
    // 创建一个模拟的文本加载器
    const blob = new Blob([knowledgeText], { type: 'text/plain' });
    const loader = new TextLoader(blob);
    const docs = await loader.load();

    // 创建实例，设置分割文本的大小和重叠大小
    const splitter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 100,
      chunkSize: 500,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // 使用MemoryVectorStore创建一个向量存储实例
    // 使用ChatOpenAI的嵌入功能
    const embeddings = {
      embedQuery: async (text: string) => {
        // 创建一个临时的 OpenAI Embeddings 实例用于向量嵌入
        const { OpenAIEmbeddings } = await import("@langchain/openai");
        const embedder = new OpenAIEmbeddings({
          configuration: {
            apiKey: import.meta.env.VITE_SILICONFLOW_API_KEY || "sk----",
            baseURL: "https://api.siliconflow.cn/v1",
          },
          model: "BAAI/bge-large-zh-v1.5", // 硅基流动兼容的嵌入模型
        });
        const response = await embedder.embedQuery(text);
        return response;
      },
      embedDocuments: async (texts: string[]) => {
        // 创建一个临时的 OpenAI Embeddings 实例用于向量嵌入
        const { OpenAIEmbeddings } = await import("@langchain/openai");
        const embedder = new OpenAIEmbeddings({
          configuration: {
            apiKey: import.meta.env.VITE_SILICONFLOW_API_KEY || "sk----",
            baseURL: "https://api.siliconflow.cn/v1",
          },
          model: "BAAI/bge-large-zh-v1.5", // 硅基流动兼容的嵌入模型
        });
        const response = await embedder.embedDocuments(texts);
        return response;
      }
    };

    const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings
    );

    this.retriever = vectorStore.asRetriever(2);
    this.isInitialized = true; // 标记已完成初始化
  }

  async init() {
    // 只有当未初始化时才执行初始化
    if (!this.isInitialized) {
      await this.initVector();
    }
    this.generateTemplate(); // 现在是生成系统提示词
  }

  convertDocsToString(documents: Document[]): string {
    return documents.map((document) => document.pageContent).join("\n");
  }

  // 流式处理版本的ask方法，支持中断
  async askStreaming(question: string, options?: { signal?: AbortSignal }) {
    // 确保已经初始化
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.retriever) {
      this.questions.push(question);
      return;
    }

    const contextRetrieverChain = RunnableSequence.from([
      // 1. 从输入中提取问题
      (input) => input.question,
      // 2. 从向量存储中检索文档
      this.retriever,
      // 3. 将文档转换为字符串
      this.convertDocsToString,
    ]);

    // 创建专门用于流式处理的 RAG 链
    this.streamingRagChain = RunnableSequence.from([
      {
        context: contextRetrieverChain,
        question: (input) => input.question,
      },
      async (input) => {
        // 构造带有系统提示词的消息
        const systemMessage = new SystemMessage(
            this.systemPrompt.replace("{context}", input.context)
        );

        // 调用模型并获取流式响应，传递 signal 用于中断请求
        const stream = await this.chatModel.stream([
          systemMessage,
          new HumanMessage(input.question)
        ], {
          signal: options?.signal
        });

        return stream;
      }
    ]);

    // 调用模型并获取流式响应，传递 signal 用于中断请求
    const stream = await this.streamingRagChain.stream({ question }, {
      signal: options?.signal
    });

    return stream;
  }

  generateTemplate() {
    // 这是系统提示词，应该作为 SystemMessage 使用
    this.systemPrompt = `
# 角色定位  
你是面向成都职业技术学院这所高校的毕业论文管理的综合平台的对话小组手，叫：橙汁儿，负责以自然流畅的日常交流语气，协助用户查询答辩相关信息、完成增删改查操作。  

# 核心任务  
1. **信息查询**：根据用户输入（如答辩时间、地点、参与人员、流程要求等），快速返回准确的答辩信息；  
2. **操作协助**：引导用户完成答辩安排的新增、修改、删除（如调整答辩时间、更换评委、删除重复场次等）及查询类操作，过程中主动确认关键信息，避免误操作。  

# 对话规则  
- **语气自然**：用口语化表达，避免生硬的系统指令感（如不说"请输入指令"，可改为"你想了解答辩的哪些信息呀？比如时间、地点或者流程都可以告诉我~"）；  
- **多轮引导**：若用户需求模糊（如仅说"我要改答辩"），需逐步追问细节（"是要修改答辩时间、地点，还是调整参与人员呢？"）；  
- **信息确认**：执行增删改操作前，务必与用户确认关键内容（如"你确定要删除10月20日上午9点的答辩场次吗？删除后无法恢复哦~"）；  
- **简洁高效**：回答聚焦用户需求，不冗余，若信息较多可分点说明但保持口语化。  

# 示例场景参考  
- 用户问："下周三的答辩安排在哪里？" → 答："下周三（10月18日）的答辩安排在学术楼302会议室哦，上午8点开始，评委有李教授、王老师~"  
- 用户说："我想新增一场答辩。" → 答："好呀！需要告诉我这场答辩的时间、地点、参与学生和评委信息吗？我帮你录入系统~"  
- 用户说："把我明天的答辩时间改成下午2点。" → 答："收到！你明天原计划是上午10点的答辩，改成下午2点对吗？确认修改的话我马上帮你调整~"

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
`;
  }
}

const bot = new Bot();
// 在模块加载时就开始初始化向量数据库，提高后续问答响应速度
bot.init();

export { bot };
