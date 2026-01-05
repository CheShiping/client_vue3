```ts
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { VectorStoreRetriever } from "@langchain/core/dist/vectorstores";
import {
  chatModel,
  wenxinyiyanEmbeddings,
} from "./mode";
import { readdirSync } from "fs";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { BaiduQianfanEmbeddings } from "@langchain/community/embeddings/baidu_qianfan";
import { StringOutputParser } from "@langchain/core/output_parsers";
const directory = "../db/knowledge";
import knowledge from ''

class Bot {
  questions: string[];
  retriever: VectorStoreRetriever<FaissStore>;
  prompt: any;
  chatModel: ChatOpenAI<ChatOpenAICallOptions>;
  embeddings: BaiduQianfanEmbeddings;
  ragChain: RunnableSequence<any, string>;
  constructor() {
    this.chatModel = chatModel;
    this.embeddings = wenxinyiyanEmbeddings;
  }

  // 切割文档，存为向量
  async initVector() {
    const dir = readdirSync("../db/knowledge");
    if (dir.length) {
      return;
    }
    const loader = new TextLoader("../data/oral_defence_sys_knowledge_base.txt");
    const docs = await loader.load();

    // 创建实例，设置分割文本的大小和重叠大小
    const spliter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 100,
      chunkSize: 500,
    });

    const splitDocs = await spliter.splitDocuments(docs);

    使用MemoryVectorStore替换 FaissStore创建一个 FaissStore 实例
    // const vectorStore = await FaissStore.fromDocuments(
    //  splitDocs,
    //  this.embeddings
    // );

    // 保存向量存储
    await vectorStore.save(directory);
  }

  async init() {
    await this.initVector();
    this.generatorTemplate();
    const vectorstore = await FaissStore.load(directory, wenxinyiyanEmbeddings);
    this.retriever = vectorstore.asRetriever(2);
  }

  convertDocsToString(documents: Document[]): string {
    return documents.map((document) => document.pageContent).join("\n");
  }

  async ask(question: string) {
    if (!this.retriever) {
      this.questions.push(question);
      return;
    }

    const contextRetriverChain = RunnableSequence.from([
      // 1. 从输入中提取问题
      (input) => input.question,
      // 2. 从向量存储中检索文档
      this.retriever,
      // 3. 将文档转换为字符串
      this.convertDocsToString,
    ]);

    this.ragChain = RunnableSequence.from([
      // 1. 从输入中提取问题，然后转为字符串，然后传给prompt，然后传给chatModel
      {
        context: contextRetriverChain,
        question: (input) => input.question,
      },
      // 2固定的prompt
      this.prompt,
      // 3. 调用模型
      this.chatModel,
      // 4. 解析输出
      new StringOutputParser(),
    ]);
    const res = await this.ragChain.invoke({ question });
    return res;
  }

  generatorTemplate() {
    // 设计prompt的时候，有技巧，比如  并且回答时仅根据原文，固定LLM的回答只能根据原文内容。
    // 如果原文中没有相关内容，你可以回答“原文中没有相关内容”， 减少LLm的幻想问题。
    const TEMPLATE = `
          # 角色定位  
你是答辩管理系统的智能对话助手，负责以自然流畅的日常交流语气，协助用户查询答辩相关信息、完成增删改查操作。  

# 核心任务  
1. **信息查询**：根据用户输入（如答辩时间、地点、参与人员、流程要求等），快速返回准确的答辩信息；  
2. **操作协助**：引导用户完成答辩安排的新增、修改、删除（如调整答辩时间、更换评委、删除重复场次等）及查询类操作，过程中主动确认关键信息，避免误操作。  

# 对话规则  
- **语气自然**：用口语化表达，避免生硬的系统指令感（如不说“请输入指令”，可改为“你想了解答辩的哪些信息呀？比如时间、地点或者流程都可以告诉我~”）；  
- **多轮引导**：若用户需求模糊（如仅说“我要改答辩”），需逐步追问细节（“是要修改答辩时间、地点，还是调整参与人员呢？”）；  
- **信息确认**：执行增删改操作前，务必与用户确认关键内容（如“你确定要删除10月20日上午9点的答辩场次吗？删除后无法恢复哦~”）；  
- **简洁高效**：回答聚焦用户需求，不冗余，若信息较多可分点说明但保持口语化。  

# 示例场景参考  
- 用户问：“下周三的答辩安排在哪里？” → 答：“下周三（10月18日）的答辩安排在学术楼302会议室哦，上午8点开始，评委有李教授、王老师~”  
- 用户说：“我想新增一场答辩。” → 答：“好呀！需要告诉我这场答辩的时间、地点、参与学生和评委信息吗？我帮你录入系统~”  
- 用户说：“把我明天的答辩时间改成下午2点。” → 答：“收到！你明天原计划是上午10点的答辩，改成下午2点对吗？确认修改的话我马上帮你调整~”

          以下是原文中跟用户回答相关的内容：
          {context}

          现在，你需要基于原文，回答以下问题：
          {question}`;
    // 在运行时，我们只要将对应的变量传递给 prompt 就能将 prompt 中对应的变量替换成真实值。
    this.prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);
  }
}

const bot = new Bot();
bot.init().then(async () => {
  const content = await bot.ask("你是谁");
  console.log("content==", content);
});


```

