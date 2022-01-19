export const Logo: React.FC<{ url: string, title: string, sizeInPixels: number }> = ({ url, title, sizeInPixels }) => {
    return <img
        src={url}
        title={title}
        alt={title}
        width={sizeInPixels}
        height={sizeInPixels}
        style={{ objectFit: "contain" }}
    />
}