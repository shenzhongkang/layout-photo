'use client';
import { useEffect, useState, useTransition } from 'react';
import type { PhotoSpec } from '@/lib/types';
import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  MantineColorScheme,
  Image as MantineImage,
  Radio,
  RadioGroup,
  Select,
  useDirection,
  useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { getPixelFromCM } from '@/lib/get-pixel-from-cm';
import { useLocale, useTranslations } from 'next-intl';
import { IconLanguage, IconMoon, IconSun, IconTextDirectionLtr, IconTextDirectionRtl } from '@tabler/icons-react';
import clsx from 'clsx';
import { Locale } from '@/i18n/config';
import { setUserColorScheme, setUserLocale } from '../api/locale';

export default function LayoutPage() {
  const [photoSpecs, setPhotoSpecs] = useState<PhotoSpec[]>([]);
  const [containerSpecs, setContainerSpecs] = useState<PhotoSpec[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const t = useTranslations('layout');
  const { toggleDirection, dir } = useDirection();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const locale = useLocale();
  const [_, startTransition] = useTransition();

  const form = useForm({
    initialValues: {
      photoFile: null,
      photoSpec: '小二寸',
      containerSpec: '6寸(4R)',
      dividerColor: 'blue',
    },
    onValuesChange: (values) => {
      if (values.photoFile) {
        // read image and get width and height
        const file = values.photoFile as File;
        const reader = new FileReader();
        reader.onload = () => {
          const image = new Image();
          image.src = reader.result as string;
          image.onload = () => {
            const imgW = image.naturalWidth;
            const imgH = image.naturalHeight;
            const photoSpec = photoSpecs.find((spec) => spec.label === values.photoSpec);
            const containerSpec = containerSpecs.find((spec) => spec.label === values.containerSpec);
            if (!photoSpec || !containerSpec) return;
            const targetW = getPixelFromCM(photoSpec.width);
            const targetH = getPixelFromCM(photoSpec.height);
            let containerW = getPixelFromCM(containerSpec.width);
            let containerH = getPixelFromCM(containerSpec.height);

            // cut the source photo.
            const ratioW = imgW / targetW;
            const ratioH = imgH / targetH;

            let cutW, cutH, cutX, cutY;

            if (ratioW > ratioH) {
              cutW = targetW * ratioH;
              cutH = imgH;
              cutX = (imgW - cutW) / 2;
              cutY = 0;
            } else {
              cutH = targetH * ratioW;
              cutW = imgW;
              cutY = (imgH - cutH) / 2;
              cutX = 0;
            }

            const GAP = 5;

            let wn = Math.floor(containerW / (targetW + GAP));
            let hn = Math.floor(containerH / (targetH + GAP));

            const wn2 = Math.floor(containerH / (targetW + GAP));
            const hn2 = Math.floor(containerW / (targetH + GAP));

            if (wn2 * hn2 > wn * hn) {
              const tmp = containerW;
              containerW = containerH;
              containerH = tmp;
              wn = wn2;
              hn = hn2;
            }

            const wStart = (containerW - wn * (targetW + GAP) + GAP) / 2;
            const hStart = (containerH - hn * (targetH + GAP) + GAP) / 2;

            // create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = containerW;
            canvas.height = containerH;

            // add background color.
            ctx.fillStyle = values.dividerColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < wn; i++) {
              for (let j = 0; j < hn; j++) {
                ctx.drawImage(
                  image,
                  cutX,
                  cutY,
                  cutW,
                  cutH,
                  wStart + i * (targetW + GAP),
                  hStart + j * (targetH + GAP),
                  targetW,
                  targetH
                );
              }
            }

            const dataURL = canvas.toDataURL('image/jpeg', 1);
            setPreview(dataURL);
            setCount(wn * hn);
          };
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
  });

  useEffect(() => {
    getConfig();
  }, []);

  const getConfig = async () => {
    const res = await fetch('/api/config');
    const data: PhotoSpec[] = await res.json();
    const photoSpecs = data.filter((spec) => spec.type === 'photo');
    const containerSpecs = data.filter((spec) => spec.type === 'container');
    setPhotoSpecs(photoSpecs);
    setContainerSpecs(containerSpecs);
  };

  const download = () => {
    if (!preview) return;

    const photoSpec = form.values.photoSpec;
    const containerSpec = form.values.containerSpec;
    const filename = `${count}张${photoSpec}[以${containerSpec}冲洗]_${new Date().toISOString().slice(0, 10)}.jpg`;

    const link = document.createElement('a');
    link.href = preview;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const changeLocale = (value: string) => {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  const changeTheme = (value: string) => {
    const theme = value as MantineColorScheme;
    setColorScheme(theme);
    startTransition(() => {
      setUserColorScheme(theme);
    });
  };

  return (
    <div
      className={clsx(
        'h-full overflow-y-auto p-6',
        colorScheme === 'light' && 'bg-gradient-to-r from-rose-100 to-teal-100',
        colorScheme === 'dark' && 'bg-gradient-to-r from-slate-900 to-slate-800'
      )}
    >
      <div className='flex gap-3 mb-4 justify-end'>
        <ActionIcon
          onClick={() => {
            changeLocale(locale === 'zh' ? 'en' : 'zh');
          }}
          variant='default'
          radius='md'
          size='lg'
          aria-label='Toggle locale'
        >
          <IconLanguage stroke={1.5} />
        </ActionIcon>
        <ActionIcon
          onClick={() => changeTheme(colorScheme === 'light' ? 'dark' : 'light')}
          variant='default'
          radius='md'
          size='lg'
          aria-label='Toggle color scheme'
        >
          <IconSun stroke={1.5} className='block dark:hidden' />
          <IconMoon stroke={1.5} className='hidden dark:block' />
        </ActionIcon>
        <ActionIcon
          onClick={() => toggleDirection()}
          variant='default'
          radius='md'
          size='lg'
          aria-label='Toggle direction'
        >
          {dir === 'rtl' ? <IconTextDirectionLtr stroke={1.5} /> : <IconTextDirectionRtl stroke={1.5} />}
        </ActionIcon>
      </div>
      <form className='max-w-[500px] mx-auto flex flex-col gap-6'>
        <FileInput
          clearable
          withAsterisk
          label={t('select-photo')}
          accept='image/jpeg, image/jpg, image/png, image/tiff'
          description={t('select-photo-description')}
          placeholder={t('select-photo')}
          key={form.key('photoFile')}
          {...form.getInputProps('photoFile')}
        />
        <Select
          withAsterisk
          label={t('select-photo-spec')}
          description={t('select-photo-spec-description')}
          placeholder={t('select-photo-spec')}
          data={photoSpecs.map((spec) => ({
            label: `${spec.label} [${spec.width}cm * ${spec.height}cm]`,
            value: spec.label,
          }))}
          key={form.key('photoSpec')}
          {...form.getInputProps('photoSpec')}
        />
        <Select
          withAsterisk
          label={t('select-print-paper')}
          description={t('select-print-paper-description')}
          placeholder={t('select-print-paper')}
          data={containerSpecs.map((spec) => ({
            label: `${spec.label} [${spec.width}cm * ${spec.height}cm]`,
            value: spec.label,
          }))}
          key={form.key('containerSpec')}
          {...form.getInputProps('containerSpec')}
        />
        <RadioGroup
          label={t('select-divider-color')}
          description={t('select-divider-color-description')}
          key={form.key('dividerColor')}
          {...form.getInputProps('dividerColor')}
        >
          <Group mt='sm'>
            <Radio value='blue' label={t('blue')} />
            <Radio value='white' label={t('white')} />
            <Radio value='gray' label={t('gray')} />
          </Group>
        </RadioGroup>
        <div className='flex flex-col gap-4'>
          <span className='text-sm font-semibold'>{t('preview')}</span>
          <div>
            <MantineImage src={preview} alt='preview' fallbackSrc='/sample.jpg' />
          </div>
          <Button onClick={download}>{t('download')}</Button>
        </div>
      </form>
    </div>
  );
}
