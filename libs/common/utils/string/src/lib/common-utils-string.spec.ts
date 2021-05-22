import { TemplateRenderer, TemplateRendererOptions } from './common-utils-string';

describe('TemplateRenderer', () => {
  let options: TemplateRendererOptions;
  let renderer: TemplateRenderer;

  beforeEach(async () => {
    options = undefined;
    renderer = undefined;
  });

  it('should instantiate without any options', () => {
    renderer = new TemplateRenderer({});

    expect(renderer).toBeDefined();
  });

  it('should render from a lookup object (single replacement)', () => {
    options = {
      lookup: {
        value: 'lamb'
      },
      template: 'Mary had a little {value}.'
    };

    renderer = new TemplateRenderer(options);

    const value = renderer.render();

    expect(value).toBe('Mary had a little lamb.');
  });

  it('should render from a lookup object (multi replacement)', () => {
    options = {
      lookup: {
        verb: 'missed',
        value: 'lamb'
      },
      template: 'Mary {verb} her little {value}.'
    };

    renderer = new TemplateRenderer(options);

    const value = renderer.render();

    expect(value).toBe('Mary missed her little lamb.');
  });

  it('should render from a simple string replacement (single replacement)', () => {
    options = {
      template: 'Mary had a little {value}.',
      replacement: 'lamb'
    };

    renderer = new TemplateRenderer(options);

    const value = renderer.render();

    expect(value).toBe('Mary had a little lamb.');
  });

  it('should render from a simple string replacement (multi replacement)', () => {
    options = {
      template: 'Mary had one white {value} and one green {value}.',
      replacement: 'lamb'
    };

    renderer = new TemplateRenderer(options);

    const value = renderer.render();

    expect(value).toBe('Mary had one white lamb and one green lamb.');
  });
});
