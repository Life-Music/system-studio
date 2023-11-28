import dayjs from "dayjs";
import axios from "axios";
import type { Thumbnail } from "~/prisma/generated/mysql";

export async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


export const formatDate = (date: string | Date) => {
  return dayjs(date).format("HH:mm DD/MM/YYYY")
}

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat().format(number)
}

export const readByChunk = async (file: File, {
  byteStart = 0,
  chunkSize = 1024 * 1024 * 5,
  onSuccess,
  onFailed,
  onRead
}: {
  byteStart?: number,
  chunkSize?: number
  onSuccess?: () => void,
  onFailed?: () => void,
  onRead?: (data: ArrayBuffer, totalByte: number, byteStart: number) => Promise<void>
}) => {
  const fileSize = file.size
  let offset = byteStart

  const onLoadHandler: FileReader['onload'] = async (event) => {
    if (event.target?.error) {
      return onFailed?.()
    }
    const result = event.target?.result
    if (!result || result.constructor !== ArrayBuffer) return
    await onRead?.(result, fileSize, offset)

  }

  const read = () => {
    return new Promise((solver) => {
      const fileReader = new FileReader()
      const blob = file.slice(offset, chunkSize + offset)
      fileReader.onload = function (event) {
        onLoadHandler.call(this, event)
          .then(() => {
            solver(true)
            offset += chunkSize
          })
      }
      fileReader.readAsArrayBuffer(blob)
    })
  }

  /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
  while (true) {
    await read()
    if (offset >= fileSize) {
      onSuccess?.()
      break;
    }
  }
}

export const createResumableUpload = (uri: string) => {
  const uploader = axios.create({})

  return function (data: ArrayBuffer, byteStart: number, totalByte: number) {
    return uploader.put(uri, data, {
      headers: {
        "Content-Range": `bytes ${byteStart}-${byteStart + data.byteLength - 1}/${totalByte}`,
      }
    })
      .then((res) => {
        return res.data
      })
      .catch((e) => {
        console.log(e);
      })
  }
}

export const checkAcceptRange = (uri: string) => {
  return axios.get<{
    expirationDateTime: string,
    nextExpectedRanges: string[]
  }>(uri).then((res) => {
    return parseInt(res.data.nextExpectedRanges[0].split('-')[0])
  })
}

export const convertDuration = (durationSec: number): string => {
  const hour = Math.floor(durationSec / 60 / 60);
  const minute = Math.floor(durationSec / 60);
  const second = Math.floor(durationSec % 60);
  const hourStr = `${hour < 10 ? '0' + hour : hour}`
  const minuteStr = `${minute < 10 ? '0' + minute : minute}`
  const secondStr = `${second < 10 ? '0' + second : second}`
  if (hour) {
    return `${hourStr}:${minuteStr}:${secondStr}`
  }
  return `${minuteStr}:${secondStr}`
}

export const getThumbnailUrlPrimary = (thumbnails: Thumbnail[], id?: string): string => {
  const primary = thumbnails.find((thumbnail) => id && thumbnail.id === id || !id && thumbnail.isPrimary)
  return primary?.url ?? "/images/audio/default.png"
}

export const getAudioSource = (fileId: string) => {
  return `${import.meta.env.VITE_API_ENDPOINT}/audio/${fileId}/stream`
}