
declare type layout = "DefaultLayout" | "AuthLayout"

declare interface ResponseSuccess<T> {
  success: true,
  data: T
}

declare interface ResponseFailed {
  success?: false,
  error: string
}

declare interface AxiosResponse<T> extends ResponseSuccess<T>, ResponseFailed {

}