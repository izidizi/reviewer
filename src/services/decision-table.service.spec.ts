import { TestBed } from '@angular/core/testing';
import { DecisionTableService } from './decision-table.service';

describe('DecisionTableService', () => {
  let service: DecisionTableService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [DecisionTableService],
    }).compileComponents();

    service = TestBed.inject(DecisionTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build empty decision table', () => {
    const decisionTable = service.buildDecisionTable([], []);
    expect(decisionTable).toBeTruthy();
  });

  it('should mimic logical AND operator with two operands', () => {
    const decideAnd = service.decisionProcessor<{ a: boolean; b: boolean }>(
      ['a', 'b'],
      [
        { rule: { a: true, b: true }, outcome: true },
        { rule: { a: true, b: false }, outcome: false },
        { rule: { a: false, b: true }, outcome: false },
        { rule: { a: false, b: false }, outcome: false },
      ],
    );

    expect(decideAnd({ a: true, b: true })).toEqual(true);
    expect(decideAnd({ a: true, b: false })).toEqual(false);
    expect(decideAnd({ a: false, b: true })).toEqual(false);
    expect(decideAnd({ a: false, b: false })).toEqual(false);
  });

  it('should mimic logical XOR operator with two operands', () => {
    const decideXor = service.decisionProcessor<{ a: boolean; b: boolean }>(
      ['a', 'b'],
      [
        { rule: { a: true, b: true }, outcome: true },
        { rule: { a: false, b: false }, outcome: true },
      ],
    );

    expect(decideXor({ a: true, b: true })).toEqual(true);
    expect(decideXor({ a: true, b: false })).toEqual(false);
    expect(decideXor({ a: false, b: true })).toEqual(false);
    expect(decideXor({ a: false, b: false })).toEqual(true);
  });

  it('should mimic logical AND operator with three operands', () => {
    const decideAnd = service.decisionProcessor<{ a: boolean; b: boolean; c: boolean }>(
      ['a', 'b', 'c'],
      [{ rule: { a: true, b: true, c: true }, outcome: true }],
    );

    expect(decideAnd({ a: true, b: true, c: true })).toEqual(true);
    expect(decideAnd({ a: true, b: true, c: false })).toEqual(false);
    expect(decideAnd({ a: true, b: false, c: false })).toEqual(false);
    expect(decideAnd({ a: false, b: false, c: false })).toEqual(false);
    expect(decideAnd({ a: false, b: false, c: true })).toEqual(false);
    expect(decideAnd({ a: false, b: true, c: true })).toEqual(false);
  });

  it('should work with incomplete definitions', () => {
    const decide = service.decisionProcessor<{ a: boolean; b: boolean }>(
      ['a', 'b'],
      [{ rule: { a: true }, outcome: true }],
    );
    expect(decide({ a: true, b: true })).toEqual(true);
    expect(decide({ a: true, b: false })).toEqual(true);
    expect(decide({ a: false, b: true })).toEqual(false);
    expect(decide({ a: false, b: false })).toEqual(false);
  });

  it('should work with combined definitions', () => {
    type TestType = { a: boolean; b: boolean };
    const decide = service.decisionProcessor<TestType>(
      ['a', 'b'],
      [
        { rule: { a: true }, outcome: true },
        { rule: { a: true, b: false }, outcome: false },
      ],
    );

    expect(decide({ a: true, b: true })).toEqual(true);
    expect(decide({ a: true, b: false })).toEqual(false);
    expect(decide({ a: false, b: true })).toEqual(false);
    expect(decide({ a: false, b: false })).toEqual(false);
  });

  it('should work with combined definitions in any order', () => {
    type TestType = { a: boolean; b: boolean };
    const decide = service.decisionProcessor<TestType>(
      ['a', 'b'],
      [
        { rule: { a: true, b: false }, outcome: false },
        { rule: { a: true }, outcome: true },
      ],
    );

    expect(decide({ a: true, b: true })).toEqual(true);
    expect(decide({ a: true, b: false })).toEqual(false);
    expect(decide({ a: false, b: true })).toEqual(false);
    expect(decide({ a: false, b: false })).toEqual(false);
  });

  it('should in real world scenario', () => {
    type TestType = {
      articleExists: boolean;
      articleHasInvalidIndexDate: boolean;
      shouldReindexArticlesWithInvalidIndexDate: boolean;
      articleIndexDateOlderThatExpected: boolean;
      shouldReindexArticleWithIndexDateOlderThanExpected: boolean;
    };

    const testRules: Array<{ rule: Partial<TestType>; outcome: boolean }> = [
      { rule: { articleExists: false }, outcome: true },
      {
        rule: {
          articleExists: true,
          articleHasInvalidIndexDate: true,
          shouldReindexArticlesWithInvalidIndexDate: true,
        },
        outcome: true,
      },
      {
        rule: {
          articleExists: true,
          articleIndexDateOlderThatExpected: true,
          shouldReindexArticleWithIndexDateOlderThanExpected: true,
        },
        outcome: true,
      },
    ];
    const decisionTable = service.buildDecisionTable(
      [
        'articleExists',
        'articleHasInvalidIndexDate',
        'shouldReindexArticlesWithInvalidIndexDate',
        'articleIndexDateOlderThatExpected',
        'shouldReindexArticleWithIndexDateOlderThanExpected',
      ],
      testRules,
    );
    expect(decisionTable.length).toEqual(32);

    const decide = service.getDecisionProcessor(decisionTable);
  });
});
