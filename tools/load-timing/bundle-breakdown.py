# python bundle-breakdown.py <stats.json> <output name fragment>...: what each named output file is made of, by library.
import json, re, collections, sys

d = json.load(open(sys.argv[1]))
outs = d['outputs']


def group(p):
    p = p.replace('\\', '/')
    if 'node_modules/' in p:
        return 'npm:' + re.search(r'node_modules/((?:@[^/]+/)?[^/]+)', p).group(1)
    parts = p.split('/')
    if parts[0] == 'libs':
        return '/'.join(parts[:5 if parts[2] in ('ngx', 'feature') else 3])
    return '/'.join(parts[:2])


for frag in sys.argv[2:]:
    for k in outs:
        if frag in k and k.endswith('.js'):
            c = collections.Counter()
            for inp, v in outs[k]['inputs'].items():
                c[group(inp)] += v['bytesInOutput']
            print('\n==', k.split('/')[-1], round(outs[k]['bytes'] / 1024), 'kB')
            for g, b in c.most_common(24):
                print('   %6.1f kB  %s' % (b / 1024, g))
