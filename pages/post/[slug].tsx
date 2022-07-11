import { GetStaticProps } from 'next';
import Header from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';

interface Props {
  post: Post;
}

function Post({ post }: Props) {
  console.log(post);
  return (
    <main>
      <Header />
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
