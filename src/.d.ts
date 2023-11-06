import { Plugin, Component } from 'vue'
import 'vue-router'

export { }

declare module 'vue-router' {
  interface RouteMeta {
    layout?: layout
  }
}