import type { PresetText } from '@/types';

export const PRESET_TEXTS: PresetText[] = [
  {
    label: '0-9 数字',
    value: '0123456789',
    textType: 'number',
  },
  {
    label: '数字练习',
    value: '1234567890一二三四五六七八九十',
    textType: 'number',
  },
  {
    label: '一年级生字(一)',
    value: '一二三四五六七八九十人口手大小上下日月水火山石田土',
    textType: 'chinese',
  },
  {
    label: '一年级生字(二)',
    value: '天地人你我他爸妈哥姐弟妹男女老幼爸妈爷奶外公婆',
    textType: 'chinese',
  },
  {
    label: '常用偏旁部首',
    value: '亻彳氵冫讠扌艹宀纟钅礻衤辶廴阝卩凵刂匚冂勹厶廾弋',
    textType: 'chinese',
  },
  {
    label: '唐诗《春晓》',
    value: '春眠不觉晓处处闻啼鸟夜来风雨声花落知多少',
    textType: 'chinese',
  },
  {
    label: '唐诗《静夜思》',
    value: '床前明月光疑是地上霜举头望明月低头思故乡',
    textType: 'chinese',
  },
  {
    label: '唐诗《登鹳雀楼》',
    value: '白日依山尽黄河入海流欲穷千里目更上一层楼',
    textType: 'chinese',
  },
  {
    label: '三字经节选',
    value: '人之初性本善性相近习相远苟不教性乃迁教之道贵以专',
    textType: 'chinese',
  },
  {
    label: '百家姓开头',
    value: '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张',
    textType: 'chinese',
  },
  {
    label: '成语练习',
    value: '一心一意一帆风顺三心二意四面八方五光十色七上八下九牛一毛十全十美',
    textType: 'chinese',
  },
  {
    label: 'A-Z 大小写',
    value: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    textType: 'english',
  },
  {
    label: '英文常用词',
    value: 'Hello World Thank Goodbye Yes No Please Sorry Love Happy Family Friend School',
    textType: 'english',
  },
  {
    label: '英文数字',
    value: 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve',
    textType: 'english',
  },
  {
    label: '英文字母练习',
    value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz',
    textType: 'english',
  },
  {
    label: '励志短句',
    value: 'The best is yet to come Keep calm and carry on Never give up Stay hungry stay foolish',
    textType: 'english',
  },
];

export function getPresetsByType(textType: string): PresetText[] {
  return PRESET_TEXTS.filter((p) => p.textType === textType);
}

export const DEFAULT_TEXTS: Record<string, string> = {
  number: '0123456789',
  chinese: '一二三四五六七八九十人口手大小上下日月水火山石田土',
  english: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
};
