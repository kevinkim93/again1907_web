import { permanentRedirect } from 'next/navigation';

export default function LegacySchedulePage() {
  permanentRedirect('/gathering/schedule');
}
