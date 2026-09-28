import { FormEvent, useState } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { prisma } from '../../../lib/prisma';
import { findOwnerContent } from '../../../lib/business-content-repository';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const business = await prisma.business.findUnique({ where: { slug }, select: { id: true, slug: true, nameEn: true, isVerified: true, publicationStatus: true } });
  if (!business || business.publicationStatus !== 'PUBLISHED') return { notFound: true };
  return { props: { business: JSON.parse(JSON.stringify(business)) } };
};

export default function BusinessDashboard({ business }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [ownerId, setOwnerId] = useState(''); const [status, setStatus] = useState(''); const [kind, setKind] = useState('PROJECT'); const [titleEn, setTitleEn] = useState(''); const [bodyEn, setBodyEn] = useState('');
  const submit = async (event: FormEvent) => { event.preventDefault(); const response = await fetch(`/api/business/${business.id}/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-masfah-owner-id': ownerId }, body: JSON.stringify(kind === 'PROJECT' ? { kind, titleEn, descriptionEn: bodyEn } : { kind, titleEn, bodyEn }) }); const data = await response.json(); setStatus(response.ok ? 'Saved and sent for moderation review.' : data.message || 'Could not save content'); };
  return <><Head><title>Business Dashboard | {business.nameEn}</title></Head><main className="mx-auto max-w-5xl p-6" dir="auto"><p className="text-sm text-blue-700">Owner content is moderated before publication</p><h1 className="mt-2 text-4xl font-black">{business.nameEn} dashboard</h1><div className="mt-8 rounded-2xl border bg-gray-50 p-6"><label className="block text-sm font-bold">Verified claimant ID<input value={ownerId} onChange={(event) => setOwnerId(event.target.value)} className="mt-2 w-full rounded-lg border p-3" placeholder="Server-authenticated owner identifier" /></label><form onSubmit={submit} className="mt-6 grid gap-4"><select value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-lg border p-3"><option value="PROJECT">Project / Latest work</option><option value="UPDATE">Business update</option></select><input required value={titleEn} onChange={(event) => setTitleEn(event.target.value)} placeholder="Title" className="rounded-lg border p-3" /><textarea required value={bodyEn} onChange={(event) => setBodyEn(event.target.value)} placeholder={kind === 'PROJECT' ? 'Project description' : 'Update text'} className="min-h-32 rounded-lg border p-3" /><label className="flex gap-2 text-sm"><input type="checkbox" required /> I confirm I have permission to publish any people/team photos uploaded with this content.</label><button className="rounded-lg bg-black px-4 py-3 font-bold text-white">Submit for review</button></form>{status && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-blue-800">{status}</p>}</div><p className="mt-8 text-sm text-gray-500">Photo upload uses the storage adapter contract and remains disabled until a storage provider and authenticated upload flow are configured.</p></main></>;
}
