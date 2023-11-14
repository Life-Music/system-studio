
declare type layout = "DefaultLayout" | "AuthLayout"

declare interface ResponseSuccess<T> {
  success: true,
  data: T
}

declare interface ResponseSuccessPagination<T> extends ResponseSuccess<T> {
  meta: {
    total_object: number,
    current_page: number,
    per_page: number,
    end_page: number,
  }
}

declare interface ResponseFailed {
  success?: false,
  error: string
}

declare interface AxiosResponse<T> extends ResponseSuccess<T>, ResponseFailed {

}