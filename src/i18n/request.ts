import { getUserLocale } from '@/app/api/locale';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../../translations/${locale}.json`)).default,
  };
});
