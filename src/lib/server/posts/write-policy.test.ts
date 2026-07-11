import { describe, expect, it } from 'vitest';
import { canWriteToCategory, sanitizePostBody, validatePostInput } from './write-policy';

describe('post write policy', () => {
	it('blocks direct writes to movement target boards', () => {
		expect(canWriteToCategory({ slug: 'lil' })).toBe(true);
		expect(canWriteToCategory({ slug: 'hotdeal' })).toBe(true);
		expect(canWriteToCategory({ slug: 'big' })).toBe(false);
		expect(canWriteToCategory({ slug: 'trend' })).toBe(false);
		expect(canWriteToCategory({ slug: 'worst' })).toBe(false);
	});

	it('validates and sanitizes title and body', () => {
		expect(validatePostInput({ title: '  title  ', body: '<p>body</p>' })).toEqual({
			ok: true,
			title: 'title',
			body: '<p>body</p>'
		});
	});

	it('rejects blank title and body', () => {
		expect(validatePostInput({ title: '', body: '<p></p>' })).toEqual({
			ok: false,
			message: '제목을 입력해 주세요.'
		});
		expect(validatePostInput({ title: 'title', body: '<p><br></p>' })).toEqual({
			ok: false,
			message: '본문을 입력해 주세요.'
		});
	});

	it('removes dangerous tags and attributes', () => {
		expect(
			sanitizePostBody(
				'<p onclick="alert(1)">body<script>alert(1)</script></p><a href="javascript:alert(1)">bad link</a><strong>bold</strong>'
			)
		).toBe('<p>body</p><a>bad link</a><strong>bold</strong>');
	});

	it('allows editor media and formatting tags with safe attributes only', () => {
		expect(
			sanitizePostBody(
				'<p style="text-align:center;color:red">text</p><u>u</u><sub>2</sub><sup>3</sup><hr><img src="https://example.com/a.png" onerror="alert(1)" alt="a"><iframe src="https://www.youtube.com/embed/abc123" width="1"></iframe><table><tbody><tr><th>h</th><td>x</td></tr></tbody></table><span style="color:#ff0000;background-color:yellow;font-family:serif;font-size:18px;position:absolute">s</span>'
			)
		).toBe(
			'<p style="text-align:center;color:red">text</p><u>u</u><sub>2</sub><sup>3</sup><hr><img src="https://example.com/a.png" alt="a"><iframe src="https://www.youtube.com/embed/abc123"></iframe><table><tbody><tr><th>h</th><td>x</td></tr></tbody></table><span style="color:#ff0000;background-color:yellow;font-family:serif;font-size:18px">s</span>'
		);
	});
});
