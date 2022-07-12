import { GetStaticProps } from 'next';
import Header from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';

interface Props {
  post: Post;
}

function Post({ post }: Props) {
  return (
    <main>
      <Header />

      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="max-w-3xl mx-auto p-5 ">
        <h1 className="text-3xl mt-10 mb-3 ">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full object-cover "
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="font-extralight text-sm ">
            Blog post by{' '}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h1 className="text-xl font-bold my-5" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

      <form className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
        <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
        <h4 className="text-3xl font-bold">Leave a comment below!</h4>
        <hr className="py-3 mt-2" />

        <label className="block mb-5">
          <span className="text-gray-700">Name</span>
          <input
            className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
            placeholder="Minjun Kim"
            type="text"
          />
        </label>
        <label className="block mb-5">
          <span className="text-gray-700">Email</span>
          <input
            className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
            placeholder="Minjun Kim"
            type="text"
          />
        </label>
        <label className="block mb-5">
          <span className="text-gray-700">Comment</span>
          <textarea
            className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring"
            placeholder="Minjun Kim"
            rows={8}
          />
        </label>
      </form>
    </main>
  );
}

export default Post;

//getStaticPaths를 통해서 어떠한 페이지가 있으면 path를 알아보고, getStaticProps로 그 페이지 정보들을 가져옴

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug {
      current
    }
  }`; // slug들이 필요해서 모든 slug들 받아서 패스를 지정할 수 있게하는거
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    title,
    author -> {
    name,
    image
  },
  description,
  mainImage,
  slug,
  body
  }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug, // 이 두번째로 들어가는 변수는 45줄에 slug를 대신해주는 거를 넣을 수 있어서 그 slug값을 정해준거. getStaticPaths로 slug들(/post/[slug]로 주소가 되는거)을 다 아니까 그 해당 정보들을 여기서 알게됨.
  }); //모든 post의 정보를 알 수 있게 되었음

  if (!post) {
    return {
      notFound: true,
    };
  } //해당 포스트가 없으면 notFound 페이지가 뜸

  return {
    props: {
      post,
    }, //해당 포스트가 있으면 그 페이지의 props를 리턴하고, 그 props는 post를 가질거임->젤 위에 props 또는 {post}가 들어감.
    revalidate: 60, // 60초 후에, 기존의 캐시 버전을 업데이트함
  };
};
