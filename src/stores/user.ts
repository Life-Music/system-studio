import requestInstance from "@/utils/axios";
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
      this.userInfo ??= requestInstance.get<AxiosResponse<User | false>>("/me", {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
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