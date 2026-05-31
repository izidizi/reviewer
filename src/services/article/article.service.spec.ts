import { TestBed } from '@angular/core/testing';
import { ArticleService } from './article.service';
import { VaultArticle } from '../../app/model/vault-article';
import { ArticleId } from '../../app/model/article-id';
import { DriveId } from '../../app/model/drive-id';

const articleText = `
tags: #incomplete #tag1
[¹](#1)

### actions are events, and not commands

### reusable code should be put into functions, and not into effects

### beware effect domins (creating process)
 - action can trigger any amount of effects, but each this effect can only dispatch an action which can reduce

### References
##### 1
  author
  publication date
  [https://www.youtube.com/watch?v=JP4dEM4bjE8](https://www.youtube.com/watch?v=JP4dEM4bjE8)

---
### Links:
 - [ngrx](../../ngrx.md)
 - [link1]

created:: 2023-08-26 15:51
`;

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ArticleService],
    }).compileComponents();

    service = TestBed.inject(ArticleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseArticle positive scenario', () => {
    const testData = {
      driveId: '123',
      path: '/notes/ngrx',
      name: 'arch.md',
      text: articleText,
    };
    let result: VaultArticle;
    beforeEach(() => {
      result = service.parseArticle(testData);
    });

    it('should create articleId', () => {
      const articleId: ArticleId = result.articleId;
      expect(articleId).toEqual(`${testData.path}/${testData.name}`);
    });

    it('should create articleId', () => {
      const driveId: DriveId = result.driveId;
      expect(driveId).toEqual(testData.driveId);
    });

    it('should create path', () => {
      expect(result.path).toEqual(['notes', 'ngrx']);
    });

    it('should create path', () => {
      expect(result.name).toEqual(testData.name);
    });

    it('should create tags', () => {
      expect(result.tags).toEqual(['#incomplete', '#tag1']);
    });

    it('should create links', () => {
      expect(result.topics).toEqual(['ngrx', 'link1']);
    });

    it('should parse content', () => {
      expect(result.content).toContain('actions are events');
      expect(result.content).not.toContain('### Links');
      expect(result.content).not.toContain('### References');
    });
  });

  describe('parserLinks', () => {
    it('should extract single link from markdown text', () => {
      const text = '### Links\n[Google](https://google.com)';
      const result = service.parseTopics(text);

      expect(result).toContain('Google');
      expect(result.length).toBe(1);
    });

    it('should extract multiple links from markdown text', () => {
      const text = '### Links\n[Google](url1)\n[GitHub](url2)\n[MDN](url3)';
      const result = service.parseTopics(text);

      expect(result).toContain('Google');
      expect(result).toContain('GitHub');
      expect(result).toContain('MDN');
      expect(result.length).toBe(3);
    });

    it('should filter out empty brackets', () => {
      const text = '### Links\n[Link1](url1)\n[](empty)\n[Link2](url2)';
      const result = service.parseTopics(text);

      expect(result).toContain('Link1');
      expect(result).toContain('Link2');
      expect(result.length).toBe(2);
    });

    it('should handle text with no markdown links', () => {
      const text = 'Just plain text without any links';
      const result = service.parseTopics(text);

      expect(result.length).toBe(0);
    });

    it('should handle text with malformed links', () => {
      const text = '[Incomplete link\n[Another](url)';
      const result = service.parseTopics(text);

      // Should handle gracefully
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('Another');
    });

    it('should extract links with special characters in text', () => {
      const text = '[Link with spaces](url1)\n[Link-with-dash](url2)';
      const result = service.parseTopics(text);

      expect(result).toContain('Link with spaces');
      expect(result).toContain('Link-with-dash');
    });

    it('should handle empty string', () => {
      const text = '';
      const result = service.parseTopics(text);

      expect(result).toEqual([]);
    });
  });

  describe('Integration tests', () => {
    it('should correctly parse a realistic article', () => {
      const realArticle = {
        driveId: 'file-id-123',
        path: '/Research/Articles',
        name: 'angular-best-practices.md',
        text: `# Angular Best Practices

  ## Performance
  Use OnPush change detection strategy.

  ### Links
  [Angular Docs](https://angular.io)
  [TypeScript Handbook](https://www.typescriptlang.org/docs)
  [RxJS Guide](https://rxjs.dev)

  ### References
  Angular Team (2024). Angular Performance Guide.`,
      };

      const result = service.parseArticle(realArticle);

      expect(result.name).toBe('angular-best-practices.md');
      expect(result.topics.length).toBe(3);
      expect(result.topics).toContain('Angular Docs');
      expect(result.topics).toContain('TypeScript Handbook');
      expect(result.topics).toContain('RxJS Guide');
      expect(result.content).toContain('## Performance');
      expect(result.content).not.toContain('### References');
    });

    it('should handle article without Links or References sections', () => {
      const input = {
        driveId: 'id-simple',
        path: '/docs',
        name: 'simple.md',
        text: 'Just plain content without any sections',
      };

      const result = service.parseArticle(input);

      // When ### References is not found, content will be the entire text
      expect(result.content).toContain('Just plain content');
      expect(result.topics).toEqual([]);
    });
  });
});
