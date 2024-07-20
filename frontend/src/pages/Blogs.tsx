import Appbar from "../components/Appbar"
import BlogCard from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks"

const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        <div>
        <Appbar />
        return <div className="flex justify-center">
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
        </div>
    </div>
    }

    return (<div>
        <Appbar />


        <div className="flex justify-center">

            <div >
                {blogs.map((blog) =>
                    <BlogCard
                        // @ts-ignore
                        id={blog.id}
                        // @ts-ignore
                        authorName={blog.author.name || "Sumit"}
                        // @ts-ignore
                        title={blog.title}
                        // @ts-ignore
                        content={blog.content}
                        publishedDate="2021-10-07"
                        // @ts-ignore
                        description="blog description"
                        imageUrl="https://images.unsplash.com/photo-1721404832661-658016cde3d4?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8"
                    />
                )}
            </div>
        </div>
    </div>

    )
}

export default Blogs