export enum ImageType {
  PHOTO = 'photo',
  CONTAINER = 'container',
}

export interface PhotoSpec {
  type: ImageType;
  label: string;
  width: string | number;
  height: string | number;
}
