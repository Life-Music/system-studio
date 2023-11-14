import dayjs from "dayjs";

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
  onRead?: (data: ArrayBuffer, totalByte: number, byteStart: number) => void
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
    return new Promise((solver, reject) => {
      let fileReader = new FileReader()
      let blob = file.slice(offset, chunkSize + offset)
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

  while (true) {
    await read()
    if (offset >= fileSize) {
      onSuccess?.()
      break;
    }
  }
}