import { redirect, RedirectType } from 'next/navigation';

export default function Home() {
  redirect('/layout', RedirectType.replace);

  return <div>Hello</div>;
}
