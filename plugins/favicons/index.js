const { resolve, sep } = require('path');
const favicons = require('favicons');
const { joinPath, appendToHtml } = require('../helpers');

const devIcons = {
  favicons: true,
  android: false,
  appleIcon: false,
  appleStartup: false,
  coast: false,
  firefox: false,
  windows: false,
  yandex: false,
};

const prodIcons = {
  favicons: true,
  android: true,
  appleIcon: true,
  appleStartup: true,
  coast: true,
  firefox: true,
  windows: true,
  yandex: false,
};

const createIcons = (source, options) => new Promise((done) => {
  favicons(source, options, (error, response) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
      done(null);
      return;
    }
    if (!response || !Array.isArray(response.images)) {
      // eslint-disable-next-line no-console
      console.log('No favicons created.');
      done(null);
      return;
    }
    done({ ...response });
  });
});

const faviconsPlugin = (pluginConfig = {}) => {
  if (!pluginConfig.source) {
    // eslint-disable-next-line no-console
    console.error('No "source" set on favicons plugin. Skipping…');
    return [];
  }
  let destination = '';
  let options = {};
  let contentPromise;

  return [
    {
      name: 'biotope-build-plugin-favicons',
      hook: 'before-build',
      runner({ production }) {
        destination = pluginConfig.destination
          ? resolve(pluginConfig.destination).replace(`${process.cwd()}${sep}`, '')
          : '';
        options = {
          ...favicons.config.defaults,
          icons: production ? prodIcons : devIcons,
          ...(pluginConfig.options || {}),
        };

        contentPromise = createIcons(pluginConfig.source, options);
      },
    },
    {
      name: 'biotope-build-plugin-favicons',
      hook: 'before-emit',
      async runner(_, [{ outputFiles, addFile }]) {
        if (!contentPromise) {
          return Promise.resolve();
        }
        let faviconContent;
        contentPromise.then((data) => {
          faviconContent = data;
        });

        return new Promise((done) => {
          const tryFinish = () => {
            if (faviconContent === undefined) {
              setTimeout(tryFinish);
              return;
            }

            const { images, files, html } = faviconContent;
            const htmlNodes = html.filter((node) => node.indexOf('rel="manifest"') < 0);

            [...images, ...files.filter(({ name }) => name === 'browserconfig.xml')]
              .forEach(({ name, contents }) => addFile({
                name: joinPath(destination, name).replace(/\//g, sep),
                content: contents,
              }));

            appendToHtml({ outputFiles, addFile }, 'favicons', htmlNodes, options.path, destination);
            done();
          };
          tryFinish();
        });
      },
    },
  ];
};

module.exports = faviconsPlugin;
