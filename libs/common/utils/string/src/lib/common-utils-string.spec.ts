import { hasTemplateExpression, renderTemplateRows, TemplateRenderer, TemplateRendererOptions } from './common-utils-string';

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

  it('should preserve unresolved template placeholders by default', () => {
    options = {
      lookup: {
        value: 'lamb'
      },
      template: 'Mary had a little {value} named {name}.'
    };

    renderer = new TemplateRenderer(options);

    const value = renderer.render();

    expect(value).toBe('Mary had a little lamb named {name}.');
  });

  it('should apply nullishReplacement for unresolved placeholders', () => {
    options = {
      lookup: {
        value: 'lamb'
      },
      template: 'Mary had a little {value} named {name}.',
      options: {
        nullishReplacement: '',
        trim: true
      }
    };

    renderer = new TemplateRenderer(options);

    const value = renderer.render();

    expect(value).toBe('Mary had a little lamb named .');
  });

  it('renders the first alternative with a value, skipping blank ones', () => {
    const render = (lookup: object) => new TemplateRenderer({ lookup, template: 'Area {name|zone_ID}' }).render();

    expect(render({ name: 'Ortega Lawn', zone_ID: 'AP-7' })).toBe('Area Ortega Lawn');
    expect(render({ name: null, zone_ID: 'AP-7' })).toBe('Area AP-7');
    expect(render({ name: '  ', zone_ID: 'AP-7' })).toBe('Area AP-7');
    // With none, it keeps the placeholder, as a single path does.
    expect(render({})).toBe('Area {name|zone_ID}');
  });

  it('should identify template expressions', () => {
    expect(hasTemplateExpression('Mary had a little {value}.')).toBe(true);
    expect(hasTemplateExpression('Mary had a little lamb.')).toBe(false);
    expect(hasTemplateExpression(undefined)).toBe(false);
  });
});

describe('renderTemplateRows', () => {
  const lookup = { attributes: { Access: 'Card', Notes: '', Type: null, Building: 'Evans' } };

  // The fault this exists for: a service is entitled to leave a field empty on a layer where it does not
  // apply, and the row printed "Type:" with nothing after it (#2816).
  it('drops a row whose only value is empty, label included', () => {
    const out = renderTemplateRows({
      template: '<strong>Access</strong>: {attributes.Access}\n<strong>Type</strong>: {attributes.Notes}',
      lookup
    });

    expect(out).toBe('<strong>Access</strong>: Card');
    expect(out).not.toContain('Type');
  });

  it('drops a row whose value is null as well as empty', () => {
    const out = renderTemplateRows({
      template: '<strong>Access</strong>: {attributes.Access}\n<strong>Type</strong>: {attributes.Type}',
      lookup
    });

    expect(out).toBe('<strong>Access</strong>: Card');
  });

  it('keeps every row that has a value', () => {
    const out = renderTemplateRows({
      template: '<strong>Access</strong>: {attributes.Access}\n<strong>Building</strong>: {attributes.Building}',
      lookup
    });

    expect(out).toBe('<strong>Access</strong>: Card\n<strong>Building</strong>: Evans');
  });

  // A line somebody wrote deliberately, with nothing to resolve, is not an empty row.
  it('keeps a row of static text', () => {
    const out = renderTemplateRows({
      template: 'Always shown\n<strong>Type</strong>: {attributes.Notes}',
      lookup
    });

    expect(out).toBe('Always shown');
  });

  // A single-line template is the no-op case: a popup whose whole description resolves to nothing must
  // render as it did rather than disappearing.
  it('leaves a single-line template to TemplateRenderer', () => {
    const out = renderTemplateRows({ template: '<strong>Type</strong>: {attributes.Notes}', lookup });

    expect(out).toBe('<strong>Type</strong>: ');
  });

  // Dropping every row must give an empty string rather than a line of separators.
  it('gives nothing when every row is empty', () => {
    const out = renderTemplateRows({
      template: '<strong>Type</strong>: {attributes.Notes}\n<strong>Kind</strong>: {attributes.Type}',
      lookup
    });

    expect(out).toBe('');
  });

  // A row may list fallbacks; if one of them has a value the row stays.
  it('keeps a row whose fallback has a value', () => {
    const out = renderTemplateRows({
      template: '<strong>Name</strong>: {attributes.Notes|attributes.Building}\n<strong>Type</strong>: {attributes.Type}',
      lookup
    });

    expect(out).toBe('<strong>Name</strong>: Evans');
  });
});
