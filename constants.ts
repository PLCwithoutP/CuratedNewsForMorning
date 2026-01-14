import { FeedSource } from './types';

export const DEFAULT_FEEDS: Omit<FeedSource, 'addedAt'>[] = [
  {
    id: 'aa-guncel',
    url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel',
    title: 'Anadolu Ajansı (Güncel)',
    isTurkish: true,
  },
  {
    id: 'dow-jones',
    url: 'https://feeds.content.dowjones.io/public/rss/socialeconomyfeed',
    title: 'Dow Jones Social Economy',
    isTurkish: false,
  },
  {
    id: 'aa-ekonomi',
    url: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi',
    title: 'Anadolu Ajansı (Ekonomi)',
    isTurkish: true,
  },
  {
    id: 'trt-haber',
    url: 'https://www.trthaber.com/sondakika.rss',
    title: 'TRT Haber',
    isTurkish: true,
  },
  {
    id: 'realgm',
    url: 'https://basketball.realgm.com/rss/wiretap/0/0.xml',
    title: 'RealGM Basketball',
    isTurkish: false,
  },
  {
    id: 'thehill',
    url: 'https://thehill.com/homenews/feed/',
    title: 'The Hill',
    isTurkish: false,
  },
];
