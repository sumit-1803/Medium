import { Link } from "react-router-dom";


interface BlogCardProps {
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
    // description: string;
    // imageUrl: string;
    id: string;
}


const BlogCard = ({
    id,
    authorName,
    title,
    content,
    publishedDate,
    // description,
    // imageUrl

}: BlogCardProps) => {
    return (<Link to={`/blog/${id}`}>
        <div className="border-b p-4 pb-4 max-w-screen-md  w-screen border-slate-200 cursor-pointer ">
            <div className="flex">
                    <Avatar name={authorName} />
                
                <div className="font-extralight pl-2 text-sm flex justify-center flex-col">
                    {authorName} 
                </div>
                <div className="flex justify-center flex-col pl-2"><Circle /></div>
                

                <div className="flex justify-center flex-col pl-2 font-thin text-slate-500 text-sm">
                {publishedDate}
                </div>
            </div>
            <div className="text-xl font-semibold pt-2">
                {title}
            </div>
            {/* <img src={imageUrl} alt="blog image" />
        <div>
            {description}
        </div> */}
            <div className="text-md font-thin">
                {content.slice(0, 100)}...
            </div>
            <div className="pt-4 text-slate-500 text-sm font-thin">
                {Math.ceil(content.length / 100)} min read
            </div>
        </div>
        </Link>
    )
}

export default BlogCard


export function Avatar({ name,size="small" }: { name: string, size?: "small" | "medium" }) {

    return <div className={`relative inline-flex items-center justify-center  overflow-hidden bg-gray-600 rounded-full ${size === "small" ? "w-6 h-6" : "w-10 h-10" }`}>
        <span className={`${size === "small"? "text-xs" : "text-md"} font-sm font-normal text-gray-600 dark:text-gray-300`}>
            {name.slice(0, 1).toUpperCase()}
        </span>
    </div>

}

export function Circle(){
    return <div className="h-1 w-1 rounded-full bg-slate-500 ">
    </div>
}