'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { GradeBadge, StatusBadge } from '@/components/StatusBadge';

export default function RuleTesterPage() {
  // Section 1: Normal Subject State
  const [normalMark, setNormalMark] = useState<number | string>(69);

  // Section 2: Practical Subject State
  const [practicalTheory, setPracticalTheory] = useState<number>(52);
  const [practicalPractical, setPracticalPractical] = useState<number>(19);

  // Section 3: Optional Bonus State
  const [optionalGp, setOptionalGp] = useState<number>(4.0);

  // Section 4: Absent State
  const [absentIsCompulsory, setAbsentIsCompulsory] = useState<boolean>(true);

  // Section 5: Mock Full Student State
  const [mockMarks, setMockMarks] = useState<any[]>([
    { subjectCode: 'BAN', subjectName: 'Bangla', isCompulsory: true, isPractical: false, mark: 75 },
    { subjectCode: 'ENG', subjectName: 'English', isCompulsory: true, isPractical: false, mark: 70 },
    { subjectCode: 'MAT', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, mark: 85 },
    { subjectCode: 'PHY', subjectName: 'Physics', isCompulsory: true, isPractical: true, theory: 50, practical: 20 },
    { subjectCode: 'CHE', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, theory: 48, practical: 18 },
    { subjectCode: 'BIO', subjectName: 'Biology', isCompulsory: true, isPractical: true, theory: 52, practical: 19 },
    { subjectCode: 'AGR', subjectName: 'Agriculture', isCompulsory: false, isPractical: true, theory: 55, practical: 22 }
  ]);

  // Section 1 Evaluation
  const evalNormalMark = () => {
    if (normalMark === 'AB' || normalMark === 'ab') {
      return { mark: 'AB', gradePoint: 0.0, letterGrade: 'F', status: 'FAIL', rule: 'Absent in subject → 0.0 GP' };
    }
    const num = Number(normalMark);
    if (isNaN(num) || num < 0) return { mark: 0, gradePoint: 0.0, letterGrade: 'F', status: 'FAIL', rule: 'Invalid mark' };

    let gp = 0.0;
    let rule = '0–32 → 0.0 (F)';
    if (num >= 80) { gp = 5.0; rule = '80–100 → 5.0 (A+)'; }
    else if (num >= 70) { gp = 4.0; rule = '70–79 → 4.0 (A)'; }
    else if (num >= 60) { gp = 3.5; rule = '60–69 → 3.5 (A-)'; }
    else if (num >= 50) { gp = 3.0; rule = '50–59 → 3.0 (B)'; }
    else if (num >= 40) { gp = 2.0; rule = '40–49 → 2.0 (C)'; }
    else if (num >= 33) { gp = 1.0; rule = '33–39 → 1.0 (D)'; }

    const lg = gp >= 5.0 ? 'A+' : gp >= 4.0 ? 'A' : gp >= 3.5 ? 'A-' : gp >= 3.0 ? 'B' : gp >= 2.0 ? 'C' : gp >= 1.0 ? 'D' : 'F';
    return { mark: num, gradePoint: gp, letterGrade: lg, status: gp > 0 ? 'PASS' : 'FAIL', rule };
  };

  // Section 2 Evaluation
  const evalPractical = () => {
    const theory = Number(practicalTheory);
    const practical = Number(practicalPractical);
    const theoryPass = theory >= 25;
    const practicalPass = practical >= 8;
    const total = theory + practical;

    if (!theoryPass || !practicalPass) {
      const reasons = [];
      if (!theoryPass) reasons.push(`Theory ${theory} < 25`);
      if (!practicalPass) reasons.push(`Practical ${practical} < 8`);
      return {
        theory,
        practical,
        theoryPass,
        practicalPass,
        total,
        gradePoint: 0.0,
        letterGrade: 'F',
        status: 'FAIL',
        rule: `Component failure: ${reasons.join(', ')} → 0.0 GP (FAIL)`
      };
    }

    let gp = 0.0;
    if (total >= 80) gp = 5.0;
    else if (total >= 70) gp = 4.0;
    else if (total >= 60) gp = 3.5;
    else if (total >= 50) gp = 3.0;
    else if (total >= 40) gp = 2.0;
    else if (total >= 33) gp = 1.0;

    const lg = gp >= 5.0 ? 'A+' : gp >= 4.0 ? 'A' : gp >= 3.5 ? 'A-' : gp >= 3.0 ? 'B' : gp >= 2.0 ? 'C' : gp >= 1.0 ? 'D' : 'F';
    return {
      theory,
      practical,
      theoryPass,
      practicalPass,
      total,
      gradePoint: gp,
      letterGrade: lg,
      status: gp > 0 ? 'PASS' : 'FAIL',
      rule: `Theory & Practical passed. Total ${total} → ${gp.toFixed(1)} GP (${lg})`
    };
  };

  // Section 3 Evaluation
  const evalOptionalBonus = () => {
    const gp = Number(optionalGp);
    const bonus = gp > 2.0 ? Math.max(0, Number((gp - 2.0).toFixed(2))) : 0.0;
    return { gp, bonus, formula: `max(0, ${gp.toFixed(1)} - 2.0) = ${bonus.toFixed(2)}` };
  };

  // Section 5 Evaluation (Full Mock Student)
  const evalMockStudent = () => {
    let compulsoryGpSum = 0;
    const compulsoryFails: string[] = [];
    const evaluatedSubs = mockMarks.map((m) => {
      let gp = 0.0;
      let lg = 'F';
      let isFail = false;

      if (m.isPractical) {
        const th = Number(m.theory ?? 0);
        const pr = Number(m.practical ?? 0);
        if (th < 25 || pr < 8) {
          gp = 0.0;
          lg = 'F';
          isFail = true;
        } else {
          const tot = th + pr;
          if (tot >= 80) gp = 5.0;
          else if (tot >= 70) gp = 4.0;
          else if (tot >= 60) gp = 3.5;
          else if (tot >= 50) gp = 3.0;
          else if (tot >= 40) gp = 2.0;
          else if (tot >= 33) gp = 1.0;
          lg = gp >= 5.0 ? 'A+' : gp >= 4.0 ? 'A' : gp >= 3.5 ? 'A-' : gp >= 3.0 ? 'B' : gp >= 2.0 ? 'C' : gp >= 1.0 ? 'D' : 'F';
          isFail = gp === 0;
        }
      } else {
        const mk = m.status === 'AB' ? -1 : Number(m.mark ?? 0);
        if (mk < 0) {
          gp = 0.0;
          lg = 'F';
          isFail = true;
        } else {
          if (mk >= 80) gp = 5.0;
          else if (mk >= 70) gp = 4.0;
          else if (mk >= 60) gp = 3.5;
          else if (mk >= 50) gp = 3.0;
          else if (mk >= 40) gp = 2.0;
          else if (mk >= 33) gp = 1.0;
          lg = gp >= 5.0 ? 'A+' : gp >= 4.0 ? 'A' : gp >= 3.5 ? 'A-' : gp >= 3.0 ? 'B' : gp >= 2.0 ? 'C' : gp >= 1.0 ? 'D' : 'F';
          isFail = gp === 0;
        }
      }

      if (m.isCompulsory) {
        compulsoryGpSum += gp;
        if (isFail) {
          compulsoryFails.push(m.subjectName);
        }
      }

      return { ...m, gradePoint: gp, letterGrade: lg, isFail };
    });

    const optSub = evaluatedSubs.find((s) => !s.isCompulsory);
    const optGp = optSub ? optSub.gradePoint : 0;
    const optBonus = optGp > 2.0 ? Math.max(0, Number((optGp - 2.0).toFixed(2))) : 0;

    const uncancelledGpa = Number(((compulsoryGpSum + optBonus) / 6).toFixed(2));
    const hasCompulsoryFail = compulsoryFails.length > 0;
    const finalGpa = hasCompulsoryFail ? 0.0 : Math.min(5.0, uncancelledGpa);

    let finalGrade = 'F';
    if (finalGpa >= 5.0) finalGrade = 'A+';
    else if (finalGpa >= 4.0) finalGrade = 'A';
    else if (finalGpa >= 3.5) finalGrade = 'A-';
    else if (finalGpa >= 3.0) finalGrade = 'B';
    else if (finalGpa >= 2.0) finalGrade = 'C';
    else if (finalGpa >= 1.0) finalGrade = 'D';

    return {
      evaluatedSubs,
      compulsoryGpSum,
      optGp,
      optBonus,
      uncancelledGpa,
      hasCompulsoryFail,
      compulsoryFails,
      finalGpa,
      finalGrade,
      overallResult: finalGpa > 0 ? 'PASS' : 'FAIL'
    };
  };

  const normalRes = evalNormalMark();
  const practicalRes = evalPractical();
  const optRes = evalOptionalBonus();
  const mockRes = evalMockStudent();

  return (
    <>
      <Header title="P08 Rule Tester" />

      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
        {/* Header Title Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                P08 Interactive Sandbox
              </span>
              <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                Zero Database Mutation
              </span>
            </div>
            <h1 className="font-headline-lg text-on-surface tracking-tight">P08 Rule Tester</h1>
            <p className="font-body-md text-on-surface-variant mt-0.5">
              Test P08 grading rules using custom marks in an isolated, pure in-memory calculation sandbox.
            </p>
          </div>
        </div>

        {/* 4 Interactive Test Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: NORMAL SUBJECT */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="font-title-sm font-bold text-on-surface">Normal Subject Evaluation</h2>
              </div>
              <span className="text-label-caps text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">100 Marks</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Mark (0–100 or AB)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={normalMark}
                    onChange={(e) => setNormalMark(e.target.value)}
                    className="w-32 bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setNormalMark('AB')}
                    className="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-fail font-bold text-xs rounded-lg transition-colors"
                  >
                    Set AB
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block mb-1.5">Official Threshold Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[32, 33, 39, 40, 49, 50, 59, 60, 69, 70, 79, 80].map((val) => (
                    <button
                      key={val}
                      onClick={() => setNormalMark(val)}
                      className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        normalMark === val
                          ? 'bg-primary text-white'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Output Card */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Mark: <strong className="text-on-surface font-mono">{normalRes.mark} / 100</strong></span>
                  <div className="flex items-center gap-2">
                    <GradeBadge grade={normalRes.letterGrade} />
                    <StatusBadge status={normalRes.status as any} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center font-mono text-xs border-t border-outline-variant/20 pt-2">
                  <span className="text-on-surface-variant font-sans">Grade Point:</span>
                  <span className="font-extrabold text-base text-primary">{normalRes.gradePoint.toFixed(1)}</span>
                </div>
                <div className="text-[11px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/15">
                  Rule Applied: <strong className="text-on-surface">{normalRes.rule}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRACTICAL SUBJECT */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="font-title-sm font-bold text-on-surface">Practical Subject Component Rule</h2>
              </div>
              <span className="text-label-caps text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">75 Theory + 25 Practical</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Theory (Pass &ge; 25/75)</label>
                  <input
                    type="number"
                    min="0"
                    max="75"
                    value={practicalTheory}
                    onChange={(e) => setPracticalTheory(Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Practical (Pass &ge; 8/25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={practicalPractical}
                    onChange={(e) => setPracticalPractical(Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Edge Case Buttons */}
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block mb-1.5">Edge Case Scenarios:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setPracticalTheory(24); setPracticalPractical(8); }}
                    className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs text-on-surface font-mono"
                  >
                    Theory 24 / Prac 8 (FAIL)
                  </button>
                  <button
                    onClick={() => { setPracticalTheory(25); setPracticalPractical(7); }}
                    className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs text-on-surface font-mono"
                  >
                    Theory 25 / Prac 7 (FAIL)
                  </button>
                  <button
                    onClick={() => { setPracticalTheory(25); setPracticalPractical(8); }}
                    className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs text-on-surface font-mono"
                  >
                    Theory 25 / Prac 8 (PASS)
                  </button>
                </div>
              </div>

              {/* Live Output Card */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span>Theory: <strong className={practicalRes.theoryPass ? 'text-pass' : 'text-fail'}>{practicalRes.theory}/75 ({practicalRes.theoryPass ? 'PASS' : 'FAIL'})</strong></span>
                  <span>Practical: <strong className={practicalRes.practicalPass ? 'text-pass' : 'text-fail'}>{practicalRes.practical}/25 ({practicalRes.practicalPass ? 'PASS' : 'FAIL'})</strong></span>
                </div>
                <div className="flex justify-between items-center font-mono text-xs border-t border-outline-variant/20 pt-2">
                  <span className="text-on-surface-variant font-sans">Total: {practicalRes.total}/100</span>
                  <div className="flex items-center gap-2">
                    <GradeBadge grade={practicalRes.letterGrade} />
                    <span className="font-extrabold text-base text-primary">GP {practicalRes.gradePoint.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-[11px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/15">
                  {practicalRes.rule}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: OPTIONAL BONUS */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="font-title-sm font-bold text-on-surface">Optional (4th) Subject Bonus Rule</h2>
              </div>
              <span className="text-label-caps text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">max(0, GP - 2.0)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Optional Grade Point (0.0 – 5.0)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="5"
                  value={optionalGp}
                  onChange={(e) => setOptionalGp(Number(e.target.value))}
                  className="w-32 bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Boundary Presets */}
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block mb-1.5">Standard Test Values:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[5.0, 4.0, 3.5, 3.0, 2.0, 1.0, 0.0].map((gp) => (
                    <button
                      key={gp}
                      onClick={() => setOptionalGp(gp)}
                      className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        optionalGp === gp
                          ? 'bg-primary text-white'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      GP {gp.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Output Card */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Optional GP: <strong className="text-on-surface font-mono">{optRes.gp.toFixed(1)}</strong></span>
                  <span className="text-xs font-mono font-extrabold text-pass bg-pass/10 px-2.5 py-1 rounded">
                    Bonus: +{optRes.bonus.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-on-surface border-t border-outline-variant/20 pt-2">
                  Formula: {optRes.formula}
                </div>
                <div className="text-[11px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/15">
                  {optRes.gp <= 2.0
                    ? `Optional GP is <= 2.0, so no bonus is contributed.`
                    : `Contributes +${optRes.bonus.toFixed(2)} bonus points directly to compulsory GP summation.`}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: ABSENT BEHAVIOR */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                <h2 className="font-title-sm font-bold text-on-surface">Absent (AB) Rule Comparison</h2>
              </div>
              <span className="text-label-caps text-fail bg-fail/10 px-2 py-0.5 rounded font-bold">AB Evaluation</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg">
                <button
                  onClick={() => setAbsentIsCompulsory(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    absentIsCompulsory
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Compulsory Subject AB
                </button>
                <button
                  onClick={() => setAbsentIsCompulsory(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    !absentIsCompulsory
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Optional (4th) Subject AB
                </button>
              </div>

              {/* Live Output Card */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface">
                    {absentIsCompulsory ? 'Compulsory Subject (e.g. Biology)' : 'Optional Subject (e.g. Agriculture)'}
                  </span>
                  <span className="text-xs font-mono font-bold text-fail bg-fail/10 px-2 py-0.5 rounded">
                    Status: AB
                  </span>
                </div>
                <div className="font-mono text-xs text-on-surface border-t border-outline-variant/20 pt-2 space-y-1">
                  <div>Subject Grade Point: <strong className="text-fail">0.0 (F)</strong></div>
                  <div>Optional Bonus: <strong>0.0</strong></div>
                </div>
                <div className={`text-[11px] p-2.5 rounded border ${
                  absentIsCompulsory
                    ? 'bg-fail/10 border-fail/30 text-fail'
                    : 'bg-surface-container-lowest border-outline-variant/15 text-on-surface-variant'
                }`}>
                  {absentIsCompulsory
                    ? 'Compulsory AB Rule: Absence in any compulsory subject forces overall student outcome to FAIL (Grade F, Final GPA 0.00).'
                    : 'Optional AB Rule: Absence in optional subject results in 0.0 bonus, but DOES NOT automatically fail the student if all compulsory subjects pass.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: MOCK STUDENT FULL GPA SIMULATOR */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">calculate</span>
              </div>
              <div>
                <h2 className="font-title-md font-bold text-on-surface">Mock Student GPA Simulator</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Interactive multi-subject testbed evaluating 6 compulsory subjects + 1 optional subject.
                </p>
              </div>
            </div>

            {/* Quick Fill Scenarios */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setMockMarks([
                    { subjectCode: 'BAN', subjectName: 'Bangla', isCompulsory: true, isPractical: false, mark: 75 },
                    { subjectCode: 'ENG', subjectName: 'English', isCompulsory: true, isPractical: false, mark: 70 },
                    { subjectCode: 'MAT', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, mark: 85 },
                    { subjectCode: 'PHY', subjectName: 'Physics', isCompulsory: true, isPractical: true, theory: 50, practical: 20 },
                    { subjectCode: 'CHE', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, theory: 48, practical: 18 },
                    { subjectCode: 'BIO', subjectName: 'Biology', isCompulsory: true, isPractical: true, theory: 52, practical: 19 },
                    { subjectCode: 'AGR', subjectName: 'Agriculture', isCompulsory: false, isPractical: true, theory: 55, practical: 22 }
                  ]);
                }}
                className="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-on-surface transition-colors"
              >
                Normal Pass
              </button>
              <button
                onClick={() => {
                  setMockMarks([
                    { subjectCode: 'BAN', subjectName: 'Bangla', isCompulsory: true, isPractical: false, mark: 75 },
                    { subjectCode: 'ENG', subjectName: 'English', isCompulsory: true, isPractical: false, mark: 70 },
                    { subjectCode: 'MAT', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, mark: 85 },
                    { subjectCode: 'PHY', subjectName: 'Physics', isCompulsory: true, isPractical: true, theory: 50, practical: 20 },
                    { subjectCode: 'CHE', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, theory: 20, practical: 10 },
                    { subjectCode: 'BIO', subjectName: 'Biology', isCompulsory: true, isPractical: true, theory: 52, practical: 19 },
                    { subjectCode: 'AGR', subjectName: 'Agriculture', isCompulsory: false, isPractical: true, theory: 55, practical: 22 }
                  ]);
                }}
                className="px-2.5 py-1.5 bg-fail/10 hover:bg-fail/20 text-fail rounded-lg text-xs font-semibold transition-colors"
              >
                Compulsory Fail (Chem)
              </button>
              <button
                onClick={() => {
                  setMockMarks([
                    { subjectCode: 'BAN', subjectName: 'Bangla', isCompulsory: true, isPractical: false, mark: 75 },
                    { subjectCode: 'ENG', subjectName: 'English', isCompulsory: true, isPractical: false, mark: 70 },
                    { subjectCode: 'MAT', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, mark: 85 },
                    { subjectCode: 'PHY', subjectName: 'Physics', isCompulsory: true, isPractical: true, theory: 60, practical: 6 },
                    { subjectCode: 'CHE', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, theory: 48, practical: 18 },
                    { subjectCode: 'BIO', subjectName: 'Biology', isCompulsory: true, isPractical: true, theory: 52, practical: 19 },
                    { subjectCode: 'AGR', subjectName: 'Agriculture', isCompulsory: false, isPractical: true, theory: 55, practical: 22 }
                  ]);
                }}
                className="px-2.5 py-1.5 bg-fail/10 hover:bg-fail/20 text-fail rounded-lg text-xs font-semibold transition-colors"
              >
                Practical Fail (Physics)
              </button>
              <button
                onClick={() => {
                  setMockMarks([
                    { subjectCode: 'BAN', subjectName: 'Bangla', isCompulsory: true, isPractical: false, mark: 75 },
                    { subjectCode: 'ENG', subjectName: 'English', isCompulsory: true, isPractical: false, mark: 70 },
                    { subjectCode: 'MAT', subjectName: 'Mathematics', isCompulsory: true, isPractical: false, mark: 85 },
                    { subjectCode: 'PHY', subjectName: 'Physics', isCompulsory: true, isPractical: true, theory: 50, practical: 20 },
                    { subjectCode: 'CHE', subjectName: 'Chemistry', isCompulsory: true, isPractical: true, theory: 48, practical: 18 },
                    { subjectCode: 'BIO', subjectName: 'Biology', isCompulsory: true, isPractical: true, theory: 52, practical: 19 },
                    { subjectCode: 'AGR', subjectName: 'Agriculture', isCompulsory: false, isPractical: true, theory: 30, practical: 10 }
                  ]);
                }}
                className="px-2.5 py-1.5 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#B45309] rounded-lg text-xs font-semibold transition-colors"
              >
                Low Optional GP (&le; 2.0)
              </button>
            </div>
          </div>

          {/* Subject Inputs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/60 text-label-caps text-on-surface-variant">
                  <th className="py-2.5 px-3 font-bold">CODE</th>
                  <th className="py-2.5 px-3 font-bold">SUBJECT NAME</th>
                  <th className="py-2.5 px-3 font-bold">TYPE</th>
                  <th className="py-2.5 px-3 font-bold">THEORY / MARK</th>
                  <th className="py-2.5 px-3 font-bold">PRACTICAL</th>
                  <th className="py-2.5 px-3 font-bold text-center">EARNED GP</th>
                  <th className="py-2.5 px-3 font-bold text-center">GRADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {mockRes.evaluatedSubs.map((sub, idx) => (
                  <tr key={sub.subjectCode} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{sub.subjectCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{sub.subjectName}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        {sub.isCompulsory ? 'Compulsory' : 'Optional (4th)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {sub.isPractical ? (
                        <input
                          type="number"
                          min="0"
                          max="75"
                          value={sub.theory ?? 0}
                          onChange={(e) => {
                            const updated = [...mockMarks];
                            updated[idx].theory = Number(e.target.value);
                            setMockMarks(updated);
                          }}
                          className="w-20 bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded px-2 py-1"
                        />
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.mark ?? 0}
                          onChange={(e) => {
                            const updated = [...mockMarks];
                            updated[idx].mark = Number(e.target.value);
                            setMockMarks(updated);
                          }}
                          className="w-20 bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded px-2 py-1"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {sub.isPractical ? (
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={sub.practical ?? 0}
                          onChange={(e) => {
                            const updated = [...mockMarks];
                            updated[idx].practical = Number(e.target.value);
                            setMockMarks(updated);
                          }}
                          className="w-20 bg-surface-container border border-outline-variant/30 text-on-surface font-mono font-bold rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-on-surface-variant">N/A</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold">
                      {sub.gradePoint.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <GradeBadge grade={sub.letterGrade} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Summary Box */}
          <div className={`p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-6 ${
            mockRes.overallResult === 'PASS'
              ? 'bg-pass/5 border-pass/30'
              : 'bg-fail/5 border-fail/30'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-headline-md font-extrabold text-on-surface">
                  {mockRes.overallResult}
                </h3>
                <GradeBadge grade={mockRes.finalGrade} size="lg" />
                <StatusBadge status={mockRes.overallResult as any} />
              </div>
              <p className="text-xs text-on-surface-variant font-mono">
                Compulsory GP Sum: <strong>{mockRes.compulsoryGpSum.toFixed(2)}</strong> | Optional Bonus: <strong className="text-pass">+{mockRes.optBonus.toFixed(2)}</strong> | Raw Divisor: <strong>({mockRes.compulsoryGpSum.toFixed(2)} + {mockRes.optBonus.toFixed(2)}) / 6 = {mockRes.uncancelledGpa.toFixed(2)}</strong>
              </p>
              {mockRes.hasCompulsoryFail && (
                <p className="text-xs text-fail font-bold">
                  Compulsory Failure in {mockRes.compulsoryFails.join(', ')}: Final GPA overridden to 0.00 (F).
                </p>
              )}
            </div>

            <div className="flex items-center gap-6 border-l border-outline-variant/20 pl-6">
              <div className="text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  FINAL GPA
                </span>
                <span className="font-mono text-3xl font-extrabold text-primary">
                  {mockRes.finalGpa.toFixed(2)}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  GRADE
                </span>
                <span className="font-mono text-3xl font-extrabold text-on-surface">
                  {mockRes.finalGrade}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
