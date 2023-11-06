import { createI18n } from 'vue-i18n'
import { messages as messageVi } from "./vi/message"

type MessageSchema = typeof messageVi

const i18n = createI18n<[MessageSchema], 'vi'>({
  locale: "vi",
  fallbackLocale: "en",
  legacy: false,
  messages: {
    vi: messageVi,
  }
})

export default i18n