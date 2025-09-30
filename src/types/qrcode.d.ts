declare module 'qrcode' {
  interface QRCodeOptions {
    width?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>
}
