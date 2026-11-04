import { permanentRedirect } from 'next/navigation';

export default function LegacyRegisterPage() {
  permanentRedirect('/gathering/registration');
}
