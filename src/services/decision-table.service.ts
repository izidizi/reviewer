import { Injectable } from '@angular/core';

export type DecisionTableRecord<T> = {
  recordCase: T;
  outcome: boolean;
  specificty: number;
  rules: string[];
};

@Injectable({
  providedIn: 'root',
})
export class DecisionTableService {
  buildDecisionTable<T extends { [key: string]: boolean }>(
    keys: Array<keyof T>,
    rules: Array<{ rule: Partial<T>; outcome: boolean }>,
  ): Array<{ recordCase: T; outcome: boolean }> {
    const decistionTableRecords: DecisionTableRecord<T>[] = [];

    const caseTemplate: T = keys.reduce((result, key) => ({ ...result, [key]: false }), {}) as T;

    for (let caseIndex = 0; caseIndex < 2 ** keys.length; caseIndex++) {
      const record: DecisionTableRecord<T> = {
        recordCase: { ...caseTemplate },
        outcome: false,
        specificty: 0,
        rules: [],
      };
      decistionTableRecords.push(record);
      for (let keyBitNum = 0; keyBitNum < keys.length; keyBitNum++) {
        const key = keys[keyBitNum];
        const value = (caseIndex >> keyBitNum) & 1;
        record.recordCase[key] = !!value as T[keyof T];
      }
    }

    rules
      .sort((a, b) => {
        const aSpecifity = Object.keys(a.rule).length;
        const bSpecifity = Object.keys(b.rule).length;
        return aSpecifity === bSpecifity ? 0 : aSpecifity < bSpecifity ? -1 : 1;
      })
      .forEach(({ rule, outcome }) => {
        decistionTableRecords.forEach((record) => {
          if (Object.keys(rule).every((key) => record.recordCase[key] === rule[key])) {
            const ruleSpecifity = Object.keys(rule).length;
            if (record.specificty <= ruleSpecifity) {
              record.specificty = ruleSpecifity;
              record.outcome = outcome;
              record.rules.push(JSON.stringify(rule));
            } else if (record.specificty === ruleSpecifity) {
              if (record.outcome !== outcome) {
                throw new Error(
                  `conradictionary rule ${JSON.stringify(rule)} expects ${outcome}, rules: ${JSON.stringify(record.rules)}`,
                );
              }
              record.rules.push(JSON.stringify(rule));
            } else {
              throw new Error(
                `got rule specificy ${ruleSpecifity} while expected ${record.specificty} or above (impossible error)`,
              );
            }
          }
        });
      });

    return decistionTableRecords;
  }

  getDecisionProcessor<T extends { [key: string]: boolean }>(
    decisionTable: Array<{ recordCase: T; outcome: boolean }>,
  ): (decisionCase: T) => boolean {
    return (decisionCase) => {
      const record = decisionTable.find(({ recordCase }) =>
        Object.keys(decisionCase).every((key) => recordCase[key] === decisionCase[key]),
      );

      if (!record)
        throw new Error(`decision table do not contain case ${JSON.stringify(decisionCase)}`);

      return record.outcome;
    };
  }

  decisionProcessor<T extends { [key: string]: boolean }>(
    keys: Array<keyof T>,
    rules: Array<{ rule: Partial<T>; outcome: boolean }>,
  ): (decisionCase: T) => boolean {
    const descisionTable = this.buildDecisionTable(keys, rules);
    return this.getDecisionProcessor(descisionTable);
  }
}
