import { src, dest } from 'gulp';
import * as rename from 'gulp-rename';
import * as ejs from 'gulp-ejs';

import { GulpPipeReturn } from '../../types';

const previewPath = '/../../dev-preview/';

type renderPreviewEjs = (_: string) => GulpPipeReturn;

export const renderPreviewEjsTo = (folder: string, connect?): renderPreviewEjs => (
  templatePath: string,
): GulpPipeReturn => src(templatePath)
  .pipe(ejs({}, { root: `${__dirname}${previewPath}` }))
  .pipe(rename((path: rename.ParsedPath): void => {
    // eslint-disable-next-line no-param-reassign
    path.extname = '.html';
  }))
  .pipe(dest(folder))
  .pipe(connect.reload());
