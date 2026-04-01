# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import zipfile, os

INPUT = '복장_상태_변경_규칙.xlsx'
COL_W = 200000
ROW_H = 209550
GRAY = "808080"

sid = [2]
parts = []

def nid():
    v = sid[0]; sid[0] += 1; return v

class S:
    def __init__(self, sid, fc, fr, tc, tr):
        self.id = sid
        self.fc, self.fr, self.tc, self.tr = fc, fr, tc, tr
    def top(self):
        mc = (self.fc + self.tc) // 2
        return mc, 95250, self.fr, 19050
    def bottom(self):
        mc = (self.fc + self.tc) // 2
        return mc, 95250, self.tr, 190500
    def left(self):
        mr = (self.fr + self.tr) // 2
        return self.fc, 19050, mr, 104775
    def right(self):
        mr = (self.fr + self.tr) // 2
        return self.tc, 171450, mr, 104775

def sp(name, text, fc, fr, tc, tr, prst="rect", fill="FFFFFF", fsz="1000"):
    s = nid()
    fco, fro, tco, tro = 19050, 19050, 171450, 190500
    ox = fc * COL_W + fco
    oy = fr * ROW_H + fro
    cx = (tc - fc) * COL_W + (tco - fco)
    cy = (tr - fr) * ROW_H + (tro - fro)
    parts.append(
        f'<xdr:twoCellAnchor>'
        f'<xdr:from><xdr:col>{fc}</xdr:col><xdr:colOff>{fco}</xdr:colOff>'
        f'<xdr:row>{fr}</xdr:row><xdr:rowOff>{fro}</xdr:rowOff></xdr:from>'
        f'<xdr:to><xdr:col>{tc}</xdr:col><xdr:colOff>{tco}</xdr:colOff>'
        f'<xdr:row>{tr}</xdr:row><xdr:rowOff>{tro}</xdr:rowOff></xdr:to>'
        f'<xdr:sp macro="" textlink="">'
        f'<xdr:nvSpPr><xdr:cNvPr id="{s}" name="{name}"/><xdr:cNvSpPr/></xdr:nvSpPr>'
        f'<xdr:spPr>'
        f'<a:xfrm><a:off x="{ox}" y="{oy}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        f'<a:prstGeom prst="{prst}"><a:avLst/></a:prstGeom>'
        f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>'
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{GRAY}"/></a:solidFill></a:ln>'
        f'</xdr:spPr>'
        f'<xdr:style>'
        f'<a:lnRef idx="2"><a:schemeClr val="accent1"><a:shade val="15000"/></a:schemeClr></a:lnRef>'
        f'<a:fillRef idx="1"><a:schemeClr val="accent1"/></a:fillRef>'
        f'<a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef>'
        f'<a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef>'
        f'</xdr:style>'
        f'<xdr:txBody>'
        f'<a:bodyPr vertOverflow="clip" horzOverflow="clip" rtlCol="0" anchor="ctr"/>'
        f'<a:lstStyle/>'
        f'<a:p><a:pPr algn="ctr"/>'
        f'<a:r><a:rPr lang="ko-KR" altLang="en-US" sz="{fsz}">'
        f'<a:solidFill><a:srgbClr val="000000"/></a:solidFill>'
        f'</a:rPr><a:t>{text}</a:t></a:r></a:p>'
        f'</xdr:txBody>'
        f'</xdr:sp><xdr:clientData/></xdr:twoCellAnchor>'
    )
    return S(s, fc, fr, tc, tr)

def hp(name, fc, fr, tc, tr):
    """보이지 않는 헬퍼 도형 (커넥터 경유점)"""
    s = nid()
    parts.append(
        f'<xdr:twoCellAnchor>'
        f'<xdr:from><xdr:col>{fc}</xdr:col><xdr:colOff>0</xdr:colOff>'
        f'<xdr:row>{fr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>'
        f'<xdr:to><xdr:col>{tc}</xdr:col><xdr:colOff>0</xdr:colOff>'
        f'<xdr:row>{tr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>'
        f'<xdr:sp macro="" textlink="">'
        f'<xdr:nvSpPr><xdr:cNvPr id="{s}" name="{name}"/><xdr:cNvSpPr/></xdr:nvSpPr>'
        f'<xdr:spPr>'
        f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm>'
        f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        f'<a:noFill/><a:ln><a:noFill/></a:ln>'
        f'</xdr:spPr>'
        f'<xdr:style>'
        f'<a:lnRef idx="0"><a:schemeClr val="accent1"/></a:lnRef>'
        f'<a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef>'
        f'<a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef>'
        f'<a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef>'
        f'</xdr:style>'
        f'</xdr:sp><xdr:clientData/></xdr:twoCellAnchor>'
    )
    return S(s, fc, fr, tc, tr)

def cn(name, src, src_idx, dst, dst_idx, arrow=True):
    s = nid()
    pts = [src.top, src.left, src.bottom, src.right]
    fc, fco, fr, fro = pts[src_idx]()
    pts2 = [dst.top, dst.left, dst.bottom, dst.right]
    tc, tco, tr, tro = pts2[dst_idx]()
    fx = fc * COL_W + fco; fy = fr * ROW_H + fro
    tx = tc * COL_W + tco; ty = tr * ROW_H + tro
    ox, oy = min(fx,tx), min(fy,ty)
    cx, cy = abs(tx-fx), abs(ty-fy)
    fh = ' flipH="1"' if tx < fx else ''
    fv = ' flipV="1"' if ty < fy else ''
    tail = '<a:tailEnd type="triangle"/>' if arrow else ''
    parts.append(
        f'<xdr:twoCellAnchor>'
        f'<xdr:from><xdr:col>{fc}</xdr:col><xdr:colOff>{fco}</xdr:colOff>'
        f'<xdr:row>{fr}</xdr:row><xdr:rowOff>{fro}</xdr:rowOff></xdr:from>'
        f'<xdr:to><xdr:col>{tc}</xdr:col><xdr:colOff>{tco}</xdr:colOff>'
        f'<xdr:row>{tr}</xdr:row><xdr:rowOff>{tro}</xdr:rowOff></xdr:to>'
        f'<xdr:cxnSp macro="">'
        f'<xdr:nvCxnSpPr><xdr:cNvPr id="{s}" name="{name}"/>'
        f'<xdr:cNvCxnSpPr>'
        f'<a:stCxn id="{src.id}" idx="{src_idx}"/>'
        f'<a:endCxn id="{dst.id}" idx="{dst_idx}"/>'
        f'</xdr:cNvCxnSpPr></xdr:nvCxnSpPr>'
        f'<xdr:spPr>'
        f'<a:xfrm{fh}{fv}><a:off x="{ox}" y="{oy}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        f'<a:prstGeom prst="straightConnector1"><a:avLst/></a:prstGeom>'
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{GRAY}"/></a:solidFill>'
        f'{tail}</a:ln>'
        f'</xdr:spPr>'
        f'<xdr:style>'
        f'<a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef>'
        f'<a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef>'
        f'<a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef>'
        f'<a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef>'
        f'</xdr:style>'
        f'</xdr:cxnSp><xdr:clientData/></xdr:twoCellAnchor>'
    )

def lb(name, text, fc, fr, tc, tr):
    s = nid()
    parts.append(
        f'<xdr:twoCellAnchor>'
        f'<xdr:from><xdr:col>{fc}</xdr:col><xdr:colOff>0</xdr:colOff>'
        f'<xdr:row>{fr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>'
        f'<xdr:to><xdr:col>{tc}</xdr:col><xdr:colOff>0</xdr:colOff>'
        f'<xdr:row>{tr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>'
        f'<xdr:sp macro="" textlink="">'
        f'<xdr:nvSpPr><xdr:cNvPr id="{s}" name="{name}"/><xdr:cNvSpPr/></xdr:nvSpPr>'
        f'<xdr:spPr>'
        f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm>'
        f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        f'<a:noFill/><a:ln><a:noFill/></a:ln>'
        f'</xdr:spPr>'
        f'<xdr:style>'
        f'<a:lnRef idx="0"><a:schemeClr val="accent1"/></a:lnRef>'
        f'<a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef>'
        f'<a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef>'
        f'<a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef>'
        f'</xdr:style>'
        f'<xdr:txBody>'
        f'<a:bodyPr wrap="none" rtlCol="0" anchor="ctr"/>'
        f'<a:lstStyle/>'
        f'<a:p><a:pPr algn="ctr"/>'
        f'<a:r><a:rPr lang="ko-KR" altLang="en-US" sz="900" b="1">'
        f'<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
        f'</a:rPr><a:t>{text}</a:t></a:r></a:p>'
        f'</xdr:txBody>'
        f'</xdr:sp><xdr:clientData/></xdr:twoCellAnchor>'
    )

# ============================================================
# 순서도 1: 복장 데미지 전체 흐름
# 섹션 2-(2), 0-indexed rows 63~111 (Excel R64~R112)
# ============================================================
D = 36

# 메인 흐름 (col 3~13)
s1  = sp("D01", "전투 중 피격 발생",            3, 27+D, 13, 29+D)   # 63-65
s2  = sp("D02", "발동한 StatusEffect 확인",     3, 31+D, 13, 33+D)   # 67-69
s3  = sp("D03", "CostumeDamagePoint 참조",      3, 35+D, 13, 37+D)   # 71-73
s4  = sp("D04", "복장 데미지 점수 누적",         3, 39+D, 13, 41+D)   # 75-77
d1  = sp("D05", "기준 도달?",                   3, 43+D, 13, 47+D, "diamond", "FFD5D5", "900")  # 79-83
s5  = sp("D06", "다음 단계 외형 반영",           3, 49+D, 13, 51+D)   # 85-87
s6  = sp("D07", "복장 데미지 상태 유지",         3, 53+D, 13, 55+D)   # 89-91

# 분기 1 (d1 아니오)
sb1 = sp("DS1", "점수만 갱신, 외형 유지",  16, 44+D, 24, 46+D, "rect", "FFD5D5")  # 80-82

# ★ 추가 피격 확인
nd1 = sp("D07b", "추가 피격 발생?",             3, 57+D, 13, 61+D, "diamond", "FFD5D5", "900")  # 93-97
ns1 = sp("DS0", "StatusEffect 확인 → 점수 누적",
         16, 58+D, 28, 60+D, "rect", "FFD5D5")  # 94-96

# ★ 되돌림 화살표용 헬퍼 (보이지 않는 경유점)
# h1: ns1 오른쪽 같은 높이, h2: d1 오른쪽 같은 높이
rh1 = hp("RH1", 30, 58+D, 31, 60+D)   # 94-96 (ns1과 같은 행)
rh2 = hp("RH2", 30, 44+D, 31, 46+D)   # 80-82 (d1 중간 높이)

# d2, sb2, s7, s8 (6행 이동)
D2 = D + 6
d2  = sp("D08", "원상 복구 트리거?",             3, 57+D2, 13, 61+D2, "diamond", "FFD5D5", "900")  # 99-103
sb2 = sp("DS2", "상태 유지, 피격 반복",    16, 58+D2, 24, 60+D2, "rect", "FFD5D5")  # 100-102
s7  = sp("D09", "원상 복구 실행",                3, 63+D2, 13, 65+D2)   # 105-107
s8  = sp("D10", "복장 기본 상태 복구",           3, 67+D2, 13, 69+D2)   # 109-111

# === 수직 화살표 (bottom=2 → top=0) ===
cn("DA01", s1, 2, s2, 0)
cn("DA02", s2, 2, s3, 0)
cn("DA03", s3, 2, s4, 0)
cn("DA04", s4, 2, d1, 0)
cn("DA05", d1, 2, s5, 0)   # 예
cn("DA06", s5, 2, s6, 0)
cn("DA06b", s6, 2, nd1, 0)        # s6 → nd1
cn("DA06c", nd1, 2, d2, 0)        # nd1 → d2 (아니오)
cn("DA08", d2, 2, s7, 0)   # 예
cn("DA09", s7, 2, s8, 0)

# === 수평 화살표 (right=3 → left=1) ===
cn("DA10", d1, 3, sb1, 1)         # d1 아니오
cn("DA06d", nd1, 3, ns1, 1)       # nd1 → ns1 (예)
cn("DA11", d2, 3, sb2, 1)         # d2 아니오

# === ★ 되돌림 L자 화살표: ns1 → 오른쪽 → 위로 → d1 ===
cn("DR1", ns1, 3, rh1, 1, arrow=False)   # ns1 오른쪽 → h1 (수평)
cn("DR2", rh1, 0, rh2, 2, arrow=False)   # h1 위 → h2 아래 (수직)
cn("DR3", rh2, 1, d1, 3)                 # h2 왼쪽 → d1 오른쪽 (수평, 화살표)

# === 라벨 ===
# d1
lb("DL1", "아니오", 13, 43+D, 17, 45+D)
lb("DL2", "예",     6,  47+D, 9,  49+D)
# nd1
lb("DLN1", "예",     13, 57+D, 17, 59+D)
lb("DLN2", "아니오", 6,  61+D, 10, 63+D)
# d2 (6행 이동)
lb("DL3", "아니오", 13, 57+D2, 17, 59+D2)
lb("DL4", "예",     6,  61+D2, 9,  63+D2)

# ============================================================
# 순서도 2: 복장 젖음 전체 흐름
# 섹션 3-(2), 0-indexed rows 183~225 (Excel R184~R226)
# ============================================================
W = 110

w1  = sp("W01", "Water Volume 접촉",            3, 73+W, 13, 75+W)
w2  = sp("W02", "접촉 부위 판별",                3, 77+W, 13, 79+W)
w3  = sp("W03", "해당 부위에 젖음 적용",          3, 81+W, 13, 83+W)
wd1 = sp("W04", "같은 부위 재접촉?",             3, 85+W, 13, 89+W, "diamond", "FFD5D5", "900")
w4  = sp("W05", "젖은 상태 유지",                3, 91+W, 13, 93+W)
w5  = sp("W06", "Water Volume 이탈",            3, 95+W, 13, 97+W)
w6  = sp("W07", "마름 타이머 시작",              3, 99+W, 13, 101+W)
wd2 = sp("W08", "마름 시간 도달?",               3, 103+W, 13, 107+W, "diamond", "FFD5D5", "900")
w7  = sp("W09", "Blend 값으로 서서히 마름",       3, 109+W, 13, 111+W)
w8  = sp("W10", "해당 부위 젖음 해제",           3, 113+W, 13, 115+W)

ws1 = sp("WS1", "마름 타이머 초기화",  16, 86+W, 24, 88+W, "rect", "FFD5D5")
ws2 = sp("WS2", "젖은 상태 유지",      16, 104+W, 24, 106+W, "rect", "FFD5D5")

cn("WA01", w1, 2, w2, 0)
cn("WA02", w2, 2, w3, 0)
cn("WA03", w3, 2, wd1, 0)
cn("WA04", wd1, 2, w4, 0)
cn("WA05", w4, 2, w5, 0)
cn("WA06", w5, 2, w6, 0)
cn("WA07", w6, 2, wd2, 0)
cn("WA08", wd2, 2, w7, 0)
cn("WA09", w7, 2, w8, 0)

cn("WA10", wd1, 3, ws1, 1)
cn("WA11", wd2, 3, ws2, 1)

lb("WL1", "예",     13, 85+W, 17, 87+W)
lb("WL2", "아니오", 6,  89+W, 10, 91+W)
lb("WL3", "아니오", 13, 103+W, 17, 105+W)
lb("WL4", "예",     6,  107+W, 10, 109+W)

# ============================================================
# Drawing XML 조립 + xlsx 주입
# ============================================================
drawing_xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"'
    ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
    + ''.join(parts) +
    '</xdr:wsDr>'
)

sheet_rels_xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"'
    ' Target="../drawings/drawing1.xml"/>'
    '</Relationships>'
)

tmp = INPUT + '.tmp'
os.rename(INPUT, tmp)

with zipfile.ZipFile(tmp, 'r') as zin:
    with zipfile.ZipFile(INPUT, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.namelist():
            data = zin.read(item)
            if item == 'xl/worksheets/sheet1.xml':
                s = data.decode('utf-8')
                if 'xmlns:r=' not in s:
                    s = s.replace(
                        'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
                        'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
                        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
                    )
                if '<drawing ' not in s:
                    s = s.replace('</worksheet>', '<drawing r:id="rId1"/></worksheet>')
                data = s.encode('utf-8')
            if item == '[Content_Types].xml':
                s = data.decode('utf-8')
                if 'drawing1.xml' not in s:
                    s = s.replace(
                        '</Types>',
                        '<Override PartName="/xl/drawings/drawing1.xml"'
                        ' ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
                        '</Types>'
                    )
                data = s.encode('utf-8')
            if item in ['xl/drawings/drawing1.xml', 'xl/worksheets/_rels/sheet1.xml.rels']:
                continue
            zout.writestr(item, data)
        zout.writestr('xl/drawings/drawing1.xml', drawing_xml.encode('utf-8'))
        zout.writestr('xl/worksheets/_rels/sheet1.xml.rels', sheet_rels_xml.encode('utf-8'))

os.remove(tmp)
print('순서도 주입 완료!')
