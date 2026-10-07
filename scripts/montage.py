# python3 scripts/montage.py out.png a.png b.png ... — side-by-side montage scaled to a common height
import sys
from PIL import Image
out, *files = sys.argv[1:]
ims = [Image.open(f).convert('RGB') for f in files]
h = min(i.height for i in ims)
ims = [i.resize((int(i.width * h / i.height), h)) for i in ims]
W = sum(i.width for i in ims) + 12 * (len(ims) - 1)
m = Image.new('RGB', (W, h), (20, 20, 20))
x = 0
for i in ims:
    m.paste(i, (x, 0)); x += i.width + 12
m.save(out)
