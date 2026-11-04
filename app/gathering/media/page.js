import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import GatheringDetailPage from '@/components/GatheringDetailPage';
import StructuredData from '@/components/StructuredData';
import { gatheringMedia } from '@/lib/gathering-media';
import { createPageMetadata, siteUrl } from '@/lib/site-metadata';
import './media.css';

const path = '/gathering/media';
export const metadata = createPageMetadata({ title: '초청 영상 · 뮤지컬 티저 · 포스터', description: '제6차 Again 1907 평양대부흥회 초청 영상, 하나무브먼트 뮤지컬 평양의 그날, 우리의 그날 티저와 공식 포스터를 확인하세요.', path });

export default function MediaPage() {
  const imageList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: '제6차 집회 영상과 포스터',
    itemListElement: gatheringMedia.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.title, url: item.url,
      image: { '@type': 'ImageObject', url: `${siteUrl}${item.image}`, width: item.width, height: item.height, caption: item.alt },
    })),
  };
  return (
    <GatheringDetailPage title="영상·포스터" path={path} intro="제6차 집회 초청 영상과 뮤지컬 티저, 공식 포스터">
      <StructuredData data={imageList} id="gathering-media-data" />
      <ul className="media-gallery">
        {gatheringMedia.map((item) => (
          <li key={item.id} id={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <div className="media-gallery-image"><Image src={item.image} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 760px) 90vw, 360px" unoptimized /></div>
              <h2>{item.title} <ArrowUpRight size={19} aria-hidden="true" /></h2>
              <p>{item.detail}</p><span className="sr-only"> (새 탭)</span>
            </a>
          </li>
        ))}
      </ul>
    </GatheringDetailPage>
  );
}
