// Next.js API route support: https://nextjs.org/docs/api-routes/inrodcution
import sanityClient from '@sanity/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
};
const client = sanityClient(config);

export default function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body);

  try {
    client.create({
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: _id,
      },
      name,
      email,
      comment,
    });
  } catch (err) {
    return res.status(500).json({ message: `Couldn't submit comment`, err });
  }

  res.status(200).json({ message: 'Comment submitted' });
}
