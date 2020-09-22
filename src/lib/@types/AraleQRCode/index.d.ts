declare namespace AraleQRCode {
    interface config {
        text: string,
        size?: number,
        foreground?: string,
        render?: string,
        correctLevel?: number,
        backgound?: string,
        pdground?: string,
        image?: string,
        imageSize?: number
    }
    type constructor = (config: config) => CanvasCompositing
    type toDataURL = (format: string) => string
}

declare class AraleQRCode {
    constructor(config: AraleQRCode.config)
    toDataURL(format: string): string
}