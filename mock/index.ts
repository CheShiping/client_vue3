import { MockMethod } from 'vite-plugin-mock'
import userMock from './user'
import studentMock from './student'
import teacherMock from './teacher'
import paperMock from './paper'
import topicMock from './topic'
import defenseMock from './defense'
import scoreMock from './score'
import noticeMock from './notice'
import fileMock from './file'

export default [
  ...userMock,
  ...studentMock,
  ...teacherMock,
  ...paperMock,
  ...topicMock,
  ...defenseMock,
  ...scoreMock,
  ...noticeMock,
  ...fileMock
] as MockMethod[]