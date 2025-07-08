'use client';
import { useEffect, useState } from 'react';
import type { PhotoSpec } from '@/lib/types';
import { FileInput, Group, Image as MantineImage, Radio, RadioGroup, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { getPixelFromCM } from '@/lib/get-pixel-from-cm';

export default function LayoutPage() {
  const [photoSpecs, setPhotoSpecs] = useState<PhotoSpec[]>([]);
  const [containerSpecs, setContainerSpecs] = useState<PhotoSpec[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      photoFile: null,
      photoSpec: '小二寸',
      containerSpec: '6寸(4R)',
      dividerColor: 'blue',
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

  form.watch('photoFile', ({ value }) => {
    if (value) {
      // read image and get width and height
      const file = value as File;
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = () => {
          const photoSpec = photoSpecs.find((spec) => spec.label === form.values.photoSpec);
          const containerSpec = containerSpecs.find((spec) => spec.label === form.values.containerSpec);
          if (!photoSpec || !containerSpec) return;
          const selectedPhotoSpec = {
            width: getPixelFromCM(photoSpec.width),
            height: getPixelFromCM(photoSpec.height),
          };

          const wRatio = image.naturalWidth / selectedPhotoSpec.width;
          const hRatio = image.naturalHeight / selectedPhotoSpec.height;
          let cutW, cutH, cutX, cutY;

          if (wRatio > hRatio) {
            cutW = selectedPhotoSpec.width * hRatio;
            cutH = selectedPhotoSpec.height;
            cutX = (image.naturalWidth - cutW) / 2;
            cutY = 0;
          } else {
            cutW = selectedPhotoSpec.width;
            cutH = selectedPhotoSpec.height * wRatio;
            cutX = 0;
            cutY = (image.naturalHeight - cutH) / 2;
          }

          // cut image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = selectedPhotoSpec.width;
          canvas.height = selectedPhotoSpec.height;

          // add background color.
          ctx.fillStyle = form.values.dividerColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(image, cutX, cutY, cutW, cutH, 0, 0, cutW, cutH);

          const dataURL = canvas.toDataURL('image/jpeg', 1);
          setPreview(dataURL);
        };
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  });

  return (
    <div className='p-6'>
      <form className='max-w-[500px] mx-auto flex flex-col gap-6'>
        <FileInput
          clearable
          withAsterisk
          label='选择照片上传'
          accept='image/jpeg, image/jpg, image/png, image/tiff'
          description='上传单张照片，格式为 jpeg, jpg, png, tiff'
          placeholder='选择照片'
          key={form.key('photoFile')}
          {...form.getInputProps('photoFile')}
        />
        <Select
          withAsterisk
          label='选择照片规格'
          description='请确保上传的照片大小符合选择的照片规格'
          placeholder='选择照片规格'
          data={photoSpecs.map((spec) => ({
            label: `${spec.label} [${spec.width}cm * ${spec.height}cm]`,
            value: spec.label,
          }))}
          key={form.key('photoSpec')}
          {...form.getInputProps('photoSpec')}
        />
        <Select
          withAsterisk
          label='选择打印纸张'
          description='一般选择6寸的就好，这个价格最合适'
          placeholder='选择打印纸张'
          data={containerSpecs.map((spec) => ({
            label: `${spec.label} [${spec.width}cm * ${spec.height}cm]`,
            value: spec.label,
          }))}
          key={form.key('containerSpec')}
          {...form.getInputProps('containerSpec')}
        />
        <RadioGroup
          label='选择分割线颜色'
          description='用来分隔每张照片'
          key={form.key('dividerColor')}
          {...form.getInputProps('dividerColor')}
        >
          <Group mt='sm'>
            <Radio value='blue' label='蓝色' />
            <Radio value='white' label='白色' />
            <Radio value='gray' label='灰色' />
          </Group>
        </RadioGroup>
        <div>
          <span className='text-sm font-semibold'>预览</span>
          <div>
            <MantineImage src={preview} alt='preview' fallbackSrc='/sample.jpg' />
          </div>
        </div>
      </form>
    </div>
  );
}
