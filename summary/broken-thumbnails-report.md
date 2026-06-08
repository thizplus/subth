# Broken Thumbnails Report - JAV Censored

**Date**: 2026-06-08
**Total Checked**: 2,550 videos (censored-jav category)
**OK**: 2,532 (99.3%)
**Broken**: 18 (0.7%)

## CDN Path Pattern
```
https://files.subth.com/thumbnails/{CODE}.jpg
```

## Broken Codes (21)

### DLDSS Series (5)
| Code | Path | Status |
|------|------|--------|
| DLDSS-492 | /thumbnails/DLDSS-492.jpg | 404 |
| DLDSS-494 | /thumbnails/DLDSS-494.jpg | 404 |
| DLDSS-495 | /thumbnails/DLDSS-495.jpg | 404 |
| DLDSS-504 | /thumbnails/DLDSS-504.jpg | 404 |
| DLDSS-506 | /thumbnails/DLDSS-506.jpg | 404 |

### FNS Series (6)
| Code | Path | Status |
|------|------|--------|
| FNS-115 | /thumbnails/FNS-115.jpg | 404 |
| FNS-204 | /thumbnails/FNS-204.jpg | 404 |
| FNS-205 | /thumbnails/FNS-205.jpg | 404 |
| FNS-207 | /thumbnails/FNS-207.jpg | 404 |
| FNS-208 | /thumbnails/FNS-208.jpg | 404 |
| FNS-209 | /thumbnails/FNS-209.jpg | 404 |

### Others (7)
| Code | Path | Status |
|------|------|--------|
| EBWH-168 | /thumbnails/EBWH-168.jpg | 404 |
| FSDSS-466 | /thumbnails/FSDSS-466.jpg | 404 |
| MIDV-229 | /thumbnails/MIDV-229.jpg | 404 |
| SDJS-160 | /thumbnails/SDJS-160.jpg | 404 |
| SONE-978 | /thumbnails/SONE-978.jpg | 404 |
| START-036 | /thumbnails/START-036.jpg | 404 |
| STARS-633 | /thumbnails/STARS-633.jpg | 404 |

### Confirmed OK (false positive from check)
| Code | Note |
|------|------|
| SSIS-923 | มีภาพจริงใน R2 (check timeout) |
| SONE-598 | มีภาพจริงใน R2 (check timeout) |
| MIDV-247 | มีภาพจริงใน R2 (check timeout) |

## Analysis

- **DLDSS + FNS** (11 codes): batch ล่าสุดที่ import เข้า DB แต่ไม่ได้ upload thumbnail ขึ้น R2
- **Others** (7 codes): กระจาย อาจเป็น thumbnail ที่ถูกลบ หรือ upload ไม่สำเร็จ

## Fix Options

1. **Re-upload thumbnails**: หาภาพจาก source แล้ว upload ขึ้น R2 ที่ `/thumbnails/{CODE}.jpg`
2. **Remove from DB**: ลบ video ที่ไม่มี thumbnail ออก (ถ้าไม่ต้องการ)
3. **Fallback image**: ใส่ placeholder image สำหรับ video ที่ไม่มี thumbnail (frontend มีอยู่แล้ว)
