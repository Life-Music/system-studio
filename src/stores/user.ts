import requestInstance from "@/utils/axios";
import type { AxiosRequestConfig } from "axios";
import { defineStore } from "pinia";
import type { User } from "~/prisma/generated/mysql";

export const useUserInfoStore = defineStore('user', {
  state(): {
    userInfo: Promise<User | false> | null,
  } {
    return {
      userInfo: null
    }
  },
  actions: {
    init({
      access_token,
    }: { access_token?: string } = {}) {
      const headers: AxiosRequestConfig['headers'] = {}
      if (access_token) {
        headers.Authorization = `Bearer ${access_token}`
      }
      this.userInfo ??= requestInstance.get<AxiosResponse<User | false>>("/me", {
        headers
      }).then(({ data }) => {
        if (data.data && data.data.firstName) return data.data
        return false
      });
    },
    setUserInfo(userInfo: User) {
      this.userInfo = Promise.resolve(userInfo)
    },
    removeUserInfo() {
      this.userInfo = null
    }
  },
  getters: {
  }
})