/**
 * Tip cards.
 *
 * A tip card is shown twice: once before the first drill of a level, and again
 * the moment a student gets a question wrong that this tip covers. The second
 * showing is the one that teaches. A trick delivered while the mistake is still
 * warm sticks; the same trick in a textbook chapter does not.
 *
 * Every card is bilingual. English is the default; `vi` exists because most of
 * the first cohort reads Vietnamese faster than English, and a student should
 * never lose a maths point to a language gap.
 *
 * Each card opens with `when`: the sentence telling you that this is the card
 * this question wants. For arithmetic that is nearly automatic — you see 37² and
 * you reach for the square rule. For probability it is the whole difficulty. A
 * student who knows all seven probability ideas and cannot tell which one a
 * question is asking for will still score nothing, so recognition comes first on
 * the card, before any method.
 *
 * `examples` is a list of `{ ask, work }`, and both splits are deliberate. Left
 * as one string these decayed into answer keys — "first to roll a 6: p = 1/6, so
 * 6/11" — which only make sense to a reader who already knows the puzzle. And
 * welding several questions into one line ("What are 48 × 5, 36 × 11 and 78 × 11?")
 * asks a beginner to track three problems at once. One block, one question.
 */

export const TIPS = [
  {
    id: "subtract-hundreds-first",
    skill: "arith.add-subtract",
    en: {
      title: "Subtract the hundreds first, then say the middle number out loud",
      when: "Any addition or subtraction with three digits or more.",
      steps: [
        "Take away the big part before the small part.",
        "Say the intermediate number to yourself. That is what stops you dropping a hundred.",
        "Then take away what is left.",
      ],
      examples: [
        { ask: "What is 823 − 467?",
          work: "823 − 400 = 423, then 423 − 60 = 363, then 363 − 7 = 356" },
      ],
      why: "Rounding up and adding back feels clever but loses a whole hundred when you are rushed. Going left to right never does.",
    },
    vi: {
      title: "Trừ hàng trăm trước, rồi đọc to số ở giữa",
      when: "Mọi phép cộng trừ từ ba chữ số trở lên.",
      steps: [
        "Bỏ phần lớn trước, phần nhỏ sau.",
        "Đọc thầm số trung gian. Đó là thứ giữ cho bạn không rơi mất một trăm.",
        "Rồi trừ nốt phần còn lại.",
      ],
      examples: [
        { ask: "823 − 467 bằng bao nhiêu?",
          work: "823 − 400 = 423, rồi 423 − 60 = 363, rồi 363 − 7 = 356" },
      ],
      why: "Cách làm tròn lên rồi cộng bù nghe thông minh nhưng lúc vội rất hay mất nguyên một trăm. Đi từ trái sang phải thì không bao giờ.",
    },
  },
  {
    id: "split-and-add",
    skill: "arith.multiply",
    en: {
      title: "Split the second number, multiply twice, add",
      when: "Any multiplication where a number has two digits or more.",
      steps: [
        "Break the smaller factor into tens and units.",
        "Multiply each part separately.",
        "Add the two results.",
      ],
      examples: [
        { ask: "What is 17 × 54?",
          work: "17 × 50 = 850 and 17 × 4 = 68, so 850 + 68 = 918" },
      ],
      why: "Two easy multiplications beat one hard one. You are never holding more than three digits in your head.",
    },
    vi: {
      title: "Tách số thứ hai, nhân hai lần, rồi cộng",
      when: "Mọi phép nhân có số từ hai chữ số trở lên.",
      steps: [
        "Tách thừa số nhỏ hơn thành hàng chục và hàng đơn vị.",
        "Nhân từng phần riêng.",
        "Cộng hai kết quả lại.",
      ],
      examples: [
        { ask: "17 × 54 bằng bao nhiêu?",
          work: "17 × 50 = 850 và 17 × 4 = 68, nên 850 + 68 = 918" },
      ],
      why: "Hai phép nhân dễ hơn một phép nhân khó. Bạn không bao giờ phải nhớ quá ba chữ số trong đầu.",
    },
  },
  {
    id: "times-five-and-eleven",
    skill: "arith.multiply",
    en: {
      title: "×5 is half of ×10. ×11 is the digits with their sum in the middle",
      when: "The moment you spot a 5, 9, 11, 25, 50 or 99 in the question.",
      steps: [
        "For ×5: multiply by 10, then halve.",
        "For ×11 on a two-digit number: keep the outer digits, put their sum between them.",
        "If that sum is 10 or more, carry the 1 into the first digit.",
      ],
      examples: [
        { ask: "What is 48 × 5?",
          work: "48 × 10 = 480, then halve it: 240" },
        { ask: "What is 36 × 11?",
          work: "Keep the 3 and the 6, put their sum in the middle: 3 (3+6) 6 = 396" },
        { ask: "What is 78 × 11, where the middle sum passes 10?",
          work: "7 (7+8) 8 = 7 (15) 8. The 15 does not fit, so carry the 1 into the 7: 858" },
      ],
      why: "Both turn a multiplication into an addition or a halving, which are far faster under a clock.",
    },
    vi: {
      title: "×5 là một nửa của ×10. ×11 là giữ hai đầu, đặt tổng vào giữa",
      when: "Ngay khi thấy 5, 9, 11, 25, 50 hay 99 trong đề.",
      steps: [
        "Với ×5: nhân 10 rồi chia đôi.",
        "Với ×11 số hai chữ số: giữ hai chữ số ngoài, đặt tổng của chúng vào giữa.",
        "Nếu tổng đó từ 10 trở lên thì nhớ 1 sang chữ số đầu.",
      ],
      examples: [
        { ask: "48 × 5 bằng bao nhiêu?",
          work: "48 × 10 = 480, rồi chia đôi: 240" },
        { ask: "36 × 11 bằng bao nhiêu?",
          work: "Giữ 3 và 6, đặt tổng của chúng vào giữa: 3 (3+6) 6 = 396" },
        { ask: "78 × 11 bằng bao nhiêu, khi tổng ở giữa vượt quá 10?",
          work: "7 (7+8) 8 = 7 (15) 8. Số 15 không nhét vừa nên nhớ 1 sang chữ số 7: 858" },
      ],
      why: "Cả hai biến phép nhân thành phép cộng hoặc chia đôi, nhanh hơn hẳn khi có đồng hồ.",
    },
  },
  {
    id: "squares-rule-of-one",
    skill: "arith.squares",
    en: {
      title: "Any square: slide to a round number, then add back",
      when: "A square you have not memorised, so anything past about 12².",
      steps: [
        "n² = (n − d)(n + d) + d², where d slides n to something round.",
        "Choose d so one factor ends in 0.",
        "The correction d² is always small.",
      ],
      examples: [
        { ask: "What is 37²?",
          work: "Slide 3 down to reach 34, and 3 up to reach 40: 34 × 40 = 1360. Then pay back 3² = 9 → 1369" },
        { ask: "What is 48²?",
          work: "Slide 2 to reach 46 and 50: 46 × 50 = 2300. Then pay back 2² = 4 → 2304" },
      ],
      why: "It turns every square outside the memorised table into one easy multiplication by a multiple of ten.",
    },
    vi: {
      title: "Bình phương bất kỳ: trượt về số tròn, rồi cộng bù",
      when: "Một bình phương bạn chưa thuộc, tức từ khoảng 12² trở lên.",
      steps: [
        "n² = (n − d)(n + d) + d², với d là khoảng trượt n về số tròn.",
        "Chọn d sao cho một thừa số kết thúc bằng 0.",
        "Phần bù d² luôn nhỏ.",
      ],
      examples: [
        { ask: "37² bằng bao nhiêu?",
          work: "Trượt 3 xuống thành 34, và 3 lên thành 40: 34 × 40 = 1360. Rồi trả lại 3² = 9 → 1369" },
        { ask: "48² bằng bao nhiêu?",
          work: "Trượt 2 để được 46 và 50: 46 × 50 = 2300. Rồi trả lại 2² = 4 → 2304" },
      ],
      why: "Nó biến mọi bình phương ngoài bảng đã thuộc thành một phép nhân dễ với bội của mười.",
    },
  },
  {
    id: "cube-root-last-digit",
    skill: "arith.roots",
    en: {
      title: "Cube roots: the last digit gives itself away",
      when: "A cube root sign in front of a number whose last digit you can read.",
      steps: [
        "A cube's last digit determines the root's last digit uniquely.",
        "0,1,4,5,6,9 map to themselves. Only 2↔8 and 3↔7 swap.",
        "Use the leading digits to find the tens: 5832 is between 10³ and 20³, so the root is 1_.",
      ],
      examples: [
        { ask: "What is the cube root of 5,832?",
          work: "It ends in 2, so the root ends in 8. It sits between 10³ = 1,000 and 20³ = 8,000, so the root starts with 1 → 18" },
      ],
      why: "You never divide anything. Two glances and the answer is forced.",
    },
    vi: {
      title: "Căn bậc ba: chữ số cuối tự khai ra",
      when: "Thấy dấu căn bậc ba trước một số mà bạn đọc được chữ số cuối.",
      steps: [
        "Chữ số cuối của lập phương xác định duy nhất chữ số cuối của căn.",
        "0,1,4,5,6,9 giữ nguyên. Chỉ có 2↔8 và 3↔7 đổi chỗ.",
        "Dùng các chữ số đầu để tìm hàng chục: 5832 nằm giữa 10³ và 20³ nên căn là 1_.",
      ],
      examples: [
        { ask: "Căn bậc ba của 5.832 bằng bao nhiêu?",
          work: "Tận cùng là 2 nên căn tận cùng 8. Số này nằm giữa 10³ = 1.000 và 20³ = 8.000 nên căn bắt đầu bằng 1 → 18" },
      ],
      why: "Không phải chia gì cả. Nhìn hai lần là đáp án bị ép ra.",
    },
  },
  {
    id: "reduce-before-dividing",
    skill: "arith.divide",
    en: {
      title: "Cancel first, divide once",
      when: "A division with big numbers, or an equation with a multiplication on both sides.",
      steps: [
        "Look for a common factor on both sides before doing any long division.",
        "Halve both numbers as often as they are both even.",
        "Then do the one division that is left.",
      ],
      examples: [
        { ask: "Fill in the blank: 8 × 240 = 24 × ?",
          work: "8 and 24 share a factor of 8. Divide both sides by it and the line becomes 240 = 3 × ?, so the answer is 80" },
      ],
      why: "Most 4-digit-by-2-digit questions are built to cancel. Grinding through the division is the slow path the setter expects you to take.",
    },
    vi: {
      title: "Rút gọn trước, chia một lần",
      when: "Phép chia số to, hoặc đẳng thức có phép nhân ở cả hai vế.",
      steps: [
        "Tìm thừa số chung hai vế trước khi làm phép chia dài.",
        "Chia đôi cả hai số chừng nào cả hai còn chẵn.",
        "Rồi làm nốt một phép chia còn lại.",
      ],
      examples: [
        { ask: "Điền vào chỗ trống: 8 × 240 = 24 × ?",
          work: "8 và 24 cùng chia hết cho 8. Chia cả hai vế cho 8 thì dòng này thành 240 = 3 × ?, nên đáp án là 80" },
      ],
      why: "Phần lớn câu chia 4 chữ số cho 2 chữ số được dựng để rút gọn được. Cắm đầu chia là con đường chậm mà người ra đề mong bạn đi.",
    },
  },
  {
    id: "fraction-anchors",
    skill: "arith.fractions",
    en: {
      title: "Learn eight anchors, read every percentage off them",
      when: "Any fraction that has to become a decimal or a percentage.",
      steps: [
        "1/2 = 50%, 1/3 = 33.3%, 1/4 = 25%, 1/5 = 20%",
        "1/6 = 16.7%, 1/8 = 12.5%, 1/10 = 10%, 1/16 = 6.25%",
        "Everything else is an anchor plus or minus another anchor.",
      ],
      examples: [
        { ask: "What is 3/8 as a percentage?",
          work: "3/8 = 1/4 + 1/8 = 25% + 12.5% = 37.5%" },
        { ask: "What is 5/6 as a percentage?",
          work: "5/6 is one sixth short of a whole: 100% − 16.7% = 83.3%" },
      ],
      why: "Eight facts cover almost every fraction that appears. Deriving them each time costs seconds you do not have.",
    },
    vi: {
      title: "Thuộc tám cái mốc, mọi phần trăm khác đọc ra từ đó",
      when: "Bất kỳ phân số nào phải đổi ra thập phân hay phần trăm.",
      steps: [
        "1/2 = 50%, 1/3 = 33,3%, 1/4 = 25%, 1/5 = 20%",
        "1/6 = 16,7%, 1/8 = 12,5%, 1/10 = 10%, 1/16 = 6,25%",
        "Mọi cái khác là một mốc cộng hoặc trừ một mốc khác.",
      ],
      examples: [
        { ask: "3/8 bằng bao nhiêu phần trăm?",
          work: "3/8 = 1/4 + 1/8 = 25% + 12,5% = 37,5%" },
        { ask: "5/6 bằng bao nhiêu phần trăm?",
          work: "5/6 thiếu một phần sáu là tròn một: 100% − 16,7% = 83,3%" },
      ],
      why: "Tám con số phủ gần hết các phân số hay gặp. Tính lại từ đầu mỗi lần tốn đúng số giây bạn không có.",
    },
  },
  {
    id: "percent-flip",
    skill: "arith.percent",
    en: {
      title: "Percentages work both ways round, so flip to whichever side is easier",
      when: "A percentage question where one of the two numbers is friendlier than the other.",
      steps: ["x% of y is always equal to y% of x.", "Pick whichever of the two is easier to compute."],
      examples: [
        { ask: "What is 18% of 50?",
          work: "18% of 50 is awkward. Flip it: 50% of 18 is half of 18, which is 9" },
        { ask: "What is 4% of 75?",
          work: "Flip it: 75% of 4 is three quarters of 4, which is 3" },
      ],
      why: "Free, exact, and it turns roughly a third of percentage questions into something you can say instantly.",
    },
    vi: {
      title: "Phần trăm đảo được hai chiều, nên lật về phía nào dễ hơn",
      when: "Câu phần trăm mà một trong hai số dễ chịu hơn số kia.",
      steps: ["x% của y luôn bằng y% của x.", "Chọn cái nào trong hai cái dễ tính hơn."],
      examples: [
        { ask: "18% của 50 bằng bao nhiêu?",
          work: "18% của 50 thì khó. Lật lại: 50% của 18 là một nửa của 18, tức là 9" },
        { ask: "4% của 75 bằng bao nhiêu?",
          work: "Lật lại: 75% của 4 là ba phần tư của 4, tức là 3" },
      ],
      why: "Miễn phí, chính xác, và biến khoảng một phần ba câu phần trăm thành thứ nói ra được ngay.",
    },
  },
  {
    id: "sequence-differences",
    skill: "seq.find-rule",
    en: {
      title: "Differences, then ratios, then look inside the digits",
      when: "A row of numbers ending in a question mark.",
      steps: [
        "Write the gaps between consecutive terms. Constant gap means arithmetic.",
        "Gaps growing steadily means quadratic; take the differences of the differences.",
        "Constant ratio means geometric. If neither works, check digit sums, or two sequences interleaved.",
      ],
      examples: [
        { ask: "What comes next: 3, 8, 17, 30, 47, ?",
          work: "Gaps: 5, 9, 13, 17. Gaps of those: 4, 4, 4. So the next gap is 21, and 47 + 21 = 68" },
      ],
      why: "This order finds the rule for four families out of five in under ten seconds, and tells you fast when to move on.",
    },
    vi: {
      title: "Xét hiệu, rồi tỉ số, rồi soi vào bên trong chữ số",
      when: "Một dãy số kết thúc bằng dấu hỏi.",
      steps: [
        "Viết khoảng cách giữa các số liền nhau. Hiệu không đổi là cấp số cộng.",
        "Hiệu tăng đều là bậc hai; lấy hiệu của hiệu.",
        "Tỉ số không đổi là cấp số nhân. Nếu đều không phải, xem tổng chữ số, hoặc hai dãy đan xen.",
      ],
      examples: [
        { ask: "Số tiếp theo là gì: 3, 8, 17, 30, 47, ?",
          work: "Hiệu: 5, 9, 13, 17. Hiệu của hiệu: 4, 4, 4. Nên hiệu kế là 21, và 47 + 21 = 68" },
      ],
      why: "Thứ tự này tìm ra quy luật của bốn trên năm họ trong chưa tới mười giây, và báo sớm khi nào nên bỏ qua.",
    },
  },
  {
    id: "odd-one-out-majority",
    skill: "seq.odd-one-out",
    en: {
      title: "Find the rule the majority obeys, then the outlier names itself",
      when: "A row of numbers with no question mark, where you are asked which one is wrong.",
      steps: [
        "Do not hunt for the odd term. Find the pattern that most terms fit.",
        "Use the first two or three terms to guess the rule; the first term is never the broken one.",
        "Walk forward and the first term that disagrees is the answer.",
      ],
      examples: [
        { ask: "One term breaks the rule: 2, 5, 11, 23, 46, 95. Which one?",
          work: "Most of them double and add 1: 2 → 5 → 11 → 23 → 47 → 95. So 46 is the odd one; the rule needs 47" },
      ],
      why: "Staring at six numbers asking 'which looks wrong' has no method and no end. Fitting the majority does.",
    },
    vi: {
      title: "Tìm quy luật mà số đông tuân theo, kẻ lạc sẽ tự lộ",
      when: "Một dãy số không có dấu hỏi, đề hỏi số nào sai.",
      steps: [
        "Đừng đi săn số lệch. Hãy tìm quy luật mà phần lớn các số khớp.",
        "Dùng hai ba số đầu để đoán quy luật; số đầu tiên không bao giờ là số bị phá.",
        "Đi tới, số đầu tiên không khớp chính là đáp án.",
      ],
      examples: [
        { ask: "Một số không theo quy luật: 2, 5, 11, 23, 46, 95. Số nào?",
          work: "Phần lớn nhân đôi rồi cộng 1: 2 → 5 → 11 → 23 → 47 → 95. Vậy 46 là số lạc; quy luật cần 47" },
      ],
      why: "Nhìn sáu con số rồi hỏi 'cái nào trông sai' thì không có phương pháp và không có điểm dừng. Khớp số đông thì có.",
    },
  },
  {
    id: "equally-likely",
    skill: "prob.counting",
    en: {
      title: "Count the outcomes, and keep them equally likely",
      when: "Almost any probability question, as the opening move. Especially dice, cards and coins.",
      steps: [
        "Write the sample space so every outcome has the same chance.",
        "Probability is then favourable divided by total.",
        "Two dice have 36 equally likely outcomes, not 11 sums.",
      ],
      examples: [
        { ask: "Roll two dice. What is the chance the total is 5?",
          work: "Counting the dice as different, the pairs that work are (1,4) (2,3) (3,2) (4,1) → 4 out of 36 → 1/9. Not 1/11: the eleven possible totals are not equally likely" },
      ],
      why: "Almost every wrong answer in basic probability comes from counting a space whose outcomes are not equally likely.",
    },
    vi: {
      title: "Đếm các kết quả, và giữ cho chúng đồng khả năng",
      when: "Gần như mọi câu xác suất, ở nước đi đầu tiên. Nhất là xúc xắc, bài và xu.",
      steps: [
        "Viết không gian mẫu sao cho mọi kết quả có cùng cơ hội.",
        "Xác suất khi đó là số thuận lợi chia tổng.",
        "Hai xúc xắc có 36 kết quả đồng khả năng, không phải 11 tổng.",
      ],
      examples: [
        { ask: "Tung hai xúc xắc. Xác suất tổng bằng 5 là bao nhiêu?",
          work: "Coi hai xúc xắc là khác nhau, các cặp thoả mãn là (1,4) (2,3) (3,2) (4,1) → 4 trên 36 → 1/9. Không phải 1/11: mười một tổng có thể xảy ra không đồng khả năng" },
      ],
      why: "Gần như mọi đáp án sai trong xác suất cơ bản đến từ việc đếm một không gian mà các kết quả không đồng khả năng.",
    },
  },
  {
    id: "at-least-one-complement",
    skill: "prob.counting",
    en: {
      title: "'At least one' means one minus 'none'",
      when: "The words \"at least one\" appear, or something has several chances to happen.",
      steps: [
        "Never add up the cases for one, two, three successes.",
        "Compute the probability of zero successes and subtract from 1.",
      ],
      examples: [
        { ask: "Roll a die 3 times. What is the chance of getting at least one 6?",
          work: "Chance of no 6 at all: (5/6)³ = 125/216. Everything else is at least one → 1 − 125/216 = 91/216 ≈ 0.42" },
      ],
      why: "'None' is a single product. The direct sum is three or four terms and one of them is always miscounted.",
    },
    vi: {
      title: "'Ít nhất một' nghĩa là một trừ 'không có cái nào'",
      when: "Xuất hiện chữ \"ít nhất một\", hoặc một điều có nhiều cơ hội để xảy ra.",
      steps: [
        "Đừng cộng các trường hợp một, hai, ba lần thành công.",
        "Tính xác suất không thành công lần nào rồi lấy 1 trừ đi.",
      ],
      examples: [
        { ask: "Tung xúc xắc 3 lần. Xác suất có ít nhất một mặt 6 là bao nhiêu?",
          work: "Xác suất không ra mặt 6 lần nào: (5/6)³ = 125/216. Mọi trường hợp còn lại là ít nhất một → 1 − 125/216 = 91/216 ≈ 0,42" },
      ],
      why: "'Không có cái nào' chỉ là một phép nhân. Cộng trực tiếp thì ba bốn số hạng và luôn có một cái đếm sai.",
    },
  },
  {
    id: "expectation-is-a-weighted-average",
    skill: "prob.expected-value",
    en: {
      title: "Expected value is a weighted average, and it adds",
      when: "The words \"expected\", \"average\" or \"on average\" appear.",
      steps: [
        "Multiply each payoff by its probability and add.",
        "E[X + Y] = E[X] + E[Y] always, even when X and Y are dependent.",
        "E[X × Y] = E[X] × E[Y] only when they are independent.",
      ],
      examples: [
        { ask: "On average, what total do two dice show?",
          work: "One die averages (1+2+3+4+5+6)/6 = 3.5. Averages add, so 3.5 + 3.5 = 7" },
      ],
      why: "Adding expectations is the single most reusable move in the whole subject. It needs no independence and no case analysis.",
    },
    vi: {
      title: "Kỳ vọng là trung bình có trọng số, và nó cộng được",
      when: "Xuất hiện chữ \"kỳ vọng\", \"trung bình\".",
      steps: [
        "Nhân mỗi khoản với xác suất của nó rồi cộng lại.",
        "E[X + Y] = E[X] + E[Y] luôn đúng, kể cả khi X và Y phụ thuộc nhau.",
        "E[X × Y] = E[X] × E[Y] chỉ đúng khi chúng độc lập.",
      ],
      examples: [
        { ask: "Trung bình hai xúc xắc cho tổng bằng bao nhiêu?",
          work: "Một xúc xắc trung bình (1+2+3+4+5+6)/6 = 3,5. Trung bình cộng được, nên 3,5 + 3,5 = 7" },
      ],
      why: "Cộng kỳ vọng là nước đi dùng lại được nhiều nhất trong cả môn này. Không cần độc lập, không cần chia trường hợp.",
    },
  },
  {
    id: "expectation-not-one-path",
    skill: "prob.expected-value",
    en: {
      title: "The expected value is not the typical path",
      when: "Something is multiplied again and again: a price rising and falling, repeated percentage changes.",
      steps: [
        "Work out what one day does on average: it multiplies by 1.1 or by 0.9, so on average by (1.1 + 0.9)/2 = 1.",
        "The days do not affect each other, so multiply those daily averages together. Multiplying by 1 leaves the price exactly where it started.",
        "Up then down really does land at 99, but that is one path among several. Average over all of them and you are back at the starting price.",
      ],
      examples: [
        { ask: "A stock is at 100. Each day it rises 10% or falls 10%, equally likely. What is its average price after 2 days?",
          work: "Each day multiplies the price by 1.1 or 0.9, averaging (1.1 + 0.9)/2 = 1. Multiplying by 1 twice changes nothing → 100" },
        { ask: "But up then down gives 100 × 1.1 × 0.9 = 99. Why is the average not 99?",
          work: "Because that is one path of four. The four are 121, 99, 99, 81, and their average is (121 + 99 + 99 + 81)/4 = 100" },
      ],
      why: "This gap between the average outcome and the typical outcome is the whole reason volatility matters in finance. It is the most interviewed idea on this list.",
    },
    vi: {
      title: "Kỳ vọng không phải là đường đi điển hình",
      when: "Một thứ bị nhân đi nhân lại: giá lên xuống, phần trăm thay đổi nhiều lần.",
      steps: [
        "Xem một ngày trung bình làm gì: nó nhân giá với 1,1 hoặc 0,9, nên trung bình là nhân với (1,1 + 0,9)/2 = 1.",
        "Các ngày không ảnh hưởng lẫn nhau, nên cứ nhân các trung bình ngày đó lại. Nhân với 1 thì giá đứng yên đúng chỗ cũ.",
        "Lên rồi xuống đúng là ra 99, nhưng đó là một đường đi trong nhiều đường. Lấy trung bình hết thì quay về đúng giá ban đầu.",
      ],
      examples: [
        { ask: "Cổ phiếu giá 100. Mỗi ngày tăng 10% hoặc giảm 10% với khả năng như nhau. Trung bình sau 2 ngày giá bao nhiêu?",
          work: "Mỗi ngày nhân giá với 1,1 hoặc 0,9, trung bình là (1,1 + 0,9)/2 = 1. Nhân với 1 hai lần thì không đổi gì → 100" },
        { ask: "Nhưng lên rồi xuống ra 100 × 1,1 × 0,9 = 99. Sao trung bình không phải 99?",
          work: "Vì đó chỉ là một trong bốn đường đi. Bốn đường là 121, 99, 99, 81, và trung bình của chúng là (121 + 99 + 99 + 81)/4 = 100" },
      ],
      why: "Khoảng cách giữa kết quả trung bình và kết quả điển hình chính là lý do biến động quan trọng trong tài chính. Đây là ý được hỏi nhiều nhất trong danh sách này.",
    },
  },
  {
    id: "condition-shrinks-the-space",
    skill: "prob.conditional",
    en: {
      title: "Being told something crosses cases out; it never merges two into one",
      when: "The question already tells you something happened: \"given that\", \"knowing that\", \"at least one is\".",
      steps: [
        "Write the full space, cross out what the condition rules out, recount.",
        "Two children are BB, BG, GB, GG. BG and GB are different outcomes.",
        "'At least one boy' leaves three, of which one is BB.",
      ],
      examples: [
        { ask: "A family has two children and at least one is a boy. What is the chance both are boys?",
          work: "Families, oldest child first: BB, BG, GB, GG. The clue rules out GG and leaves three. One of the three is BB → 1/3" },
        { ask: "Same family, but now you are told the OLDER child is a boy. What is the chance both are boys?",
          work: "Naming a particular child is stronger information: it rules out GB as well, leaving only BB and BG → 1/2" },
      ],
      why: "The intuitive 1/2 is wrong because it silently merges BG and GB. Which fact you are told changes the answer, so read the wording twice.",
    },
    vi: {
      title: "Được cho biết một điều là gạch bớt trường hợp, không phải gộp hai thành một",
      when: "Đề đã cho biết một điều đã xảy ra: \"biết rằng\", \"cho biết\", \"có ít nhất một\".",
      steps: [
        "Viết cả không gian, gạch đi phần điều kiện loại trừ, rồi đếm lại.",
        "Hai con là BB, BG, GB, GG. BG và GB là hai kết quả khác nhau.",
        "'Có ít nhất một con trai' còn lại ba, trong đó một là BB.",
      ],
      examples: [
        { ask: "Một gia đình có hai con và có ít nhất một trai. Xác suất cả hai là trai?",
          work: "Các gia đình, con lớn trước: BB, BG, GB, GG. Dữ kiện loại GG và còn lại ba. Một trong ba là BB → 1/3" },
        { ask: "Vẫn gia đình đó, nhưng giờ bạn được cho biết con LỚN là trai. Xác suất cả hai là trai?",
          work: "Chỉ đích danh một đứa là thông tin mạnh hơn: nó loại luôn GB, chỉ còn BB và BG → 1/2" },
      ],
      why: "Trực giác 1/2 sai vì nó lặng lẽ gộp BG với GB. Bạn được cho biết điều gì sẽ đổi đáp án, nên đọc đề hai lần.",
    },
  },
  {
    id: "bayes-likelihood-share",
    skill: "prob.bayes",
    en: {
      title: "When every option was equally likely to begin with, Bayes is just a share",
      when: "You saw a result and are asked which source it came from. \"You drew red — which urn was it?\"",
      steps: [
        "For each option, ask how readily it would have produced the thing you actually saw.",
        "Add those numbers together.",
        "Your answer is your option's number divided by that total. The equal chance of picking each option sits on the top and the bottom, so it cancels and never needs writing down.",
      ],
      examples: [
        { ask: "Three coins land heads 1/4, 1/2 and 3/4 of the time. You pick one at random, flip it once, and get heads. What is the chance it was the 3/4 coin?",
          work: "Each coin's readiness to give heads: 1/4, 1/2, 3/4. Take the 3/4 coin's share of the total: (3/4) ÷ (1/4 + 1/2 + 3/4) = (3/4) ÷ (3/2) = 1/2" },
      ],
      why: "It turns Bayes from a formula you half-remember into one division you can say out loud.",
    },
    vi: {
      title: "Khi mọi khả năng ban đầu đều dễ xảy ra như nhau, Bayes chỉ là chia phần",
      when: "Bạn thấy một kết quả rồi được hỏi nó đến từ nguồn nào. \"Rút ra bóng đỏ — đó là rổ nào?\"",
      steps: [
        "Với mỗi khả năng, hỏi xem nó tạo ra đúng thứ bạn vừa thấy dễ dàng tới mức nào.",
        "Cộng các số đó lại.",
        "Đáp án là số của khả năng bạn đang hỏi chia cho tổng vừa cộng. Cơ hội chọn mỗi khả năng nằm cả ở tử lẫn mẫu nên nó triệt tiêu, khỏi cần viết ra.",
      ],
      examples: [
        { ask: "Ba đồng xu ra ngửa với tỉ lệ 1/4, 1/2 và 3/4. Bạn chọn ngẫu nhiên một đồng, tung một lần, ra ngửa. Xác suất đó là đồng 3/4?",
          work: "Mức sẵn sàng ra ngửa của từng đồng: 1/4, 1/2, 3/4. Lấy phần của đồng 3/4 trên tổng: (3/4) ÷ (1/4 + 1/2 + 3/4) = (3/4) ÷ (3/2) = 1/2" },
      ],
      why: "Nó biến Bayes từ một công thức nhớ mang máng thành một phép chia đọc ra miệng được.",
    },
  },
  {
    id: "waiting-time-one-over-p",
    skill: "prob.waiting-time",
    en: {
      title: "Waiting for something with probability p takes 1/p tries",
      when: "The question asks how many tries, rolls or flips until something finally happens.",
      steps: [
        "One 6 on a die: p = 1/6, so 6 rolls on average.",
        "Want it k times and they need not be consecutive? Just k/p, because expectations add.",
        "Consecutive is a different problem: a break sends you back to the start.",
      ],
      examples: [
        { ask: "How many rolls, on average, until a die has shown three 5s in total?",
          work: "A 5 arrives every 1 ÷ (1/6) = 6 rolls, and waits add, so 3 × 6 = 18" },
        { ask: "How many coin flips, on average, until you first see heads then tails?",
          work: "2 flips for the first head, then 2 more for a tail. Extra heads in between cost nothing, because the head is already banked → 4" },
        { ask: "And until you first see two heads in a row?",
          work: "6, not 4. After a head, a tail wipes the run out and you start over, and that restarting is the whole difference" },
      ],
      why: "HT is 4 and HH is 6 because after a head, another head still keeps you waiting for the tail, but a tail resets the run of heads.",
    },
    vi: {
      title: "Chờ một biến cố có xác suất p thì mất 1/p lần thử",
      when: "Đề hỏi bao nhiêu lần thử, bao nhiêu lần tung cho tới khi một điều xảy ra.",
      steps: [
        "Một mặt 6 trên xúc xắc: p = 1/6, nên trung bình 6 lần tung.",
        "Muốn nó xảy ra k lần và không cần liên tiếp? Chỉ là k/p, vì kỳ vọng cộng được.",
        "Liên tiếp lại là bài toán khác: đứt một cái là về lại từ đầu.",
      ],
      examples: [
        { ask: "Trung bình bao nhiêu lần tung để xúc xắc ra tổng cộng ba mặt 5?",
          work: "Một mặt 5 tới sau mỗi 1 ÷ (1/6) = 6 lần tung, và các lần chờ cộng được, nên 3 × 6 = 18" },
        { ask: "Trung bình bao nhiêu lần tung xu để lần đầu thấy ngửa rồi sấp?",
          work: "2 lần cho mặt ngửa đầu tiên, rồi 2 lần nữa cho mặt sấp. Những mặt ngửa thừa ở giữa không tốn gì, vì mặt ngửa đã có sẵn → 4" },
        { ask: "Còn để lần đầu thấy hai mặt ngửa liên tiếp?",
          work: "6, không phải 4. Sau một mặt ngửa, một mặt sấp xoá sạch chuỗi và bạn bắt đầu lại, và chính việc bắt đầu lại tạo ra khác biệt" },
      ],
      why: "HT là 4 còn HH là 6 vì sau một mặt ngửa, thêm một mặt ngửa nữa vẫn đang chờ mặt sấp, nhưng một mặt sấp thì xoá sạch chuỗi ngửa.",
    },
  },
  {
    id: "host-knows-something",
    skill: "prob.classics",
    en: {
      title: "When someone who knows the answer helps you, their choice is a message",
      when: "Someone who knows more than you acts first, and then you are offered a choice.",
      steps: [
        "Your first pick was right 1 time in 3, and nothing anyone does afterwards changes that.",
        "So 2 times in 3 the car is behind one of the other two doors.",
        "The host never opens the car, so he has just pointed out which of those two it is not. Switching collects that whole 2/3.",
      ],
      examples: [
        { ask: "Three doors, one car. You pick door 1. The host, who knows where the car is, opens door 3 to show a goat. Do you stay or switch?",
          work: "Switch. Staying wins 1/3, the chance your first pick was right. Switching wins the other 2/3" },
        { ask: "Same game but with 100 doors: you pick one, and the host opens 98 of the others to show goats. Do you switch?",
          work: "Your first pick was right 1 time in 100. The other 99 times the car is behind the single door he left shut, so switching wins 99/100" },
      ],
      why: "Two doors left feels like an even split. It is not, because the host was not picking at random. He was avoiding the car, and avoiding it is what tells you where it is.",
    },
    vi: {
      title: "Khi người biết đáp án ra tay giúp bạn, lựa chọn của họ là một lời nhắn",
      when: "Một người biết nhiều hơn bạn ra tay trước, rồi bạn được cho một lựa chọn.",
      steps: [
        "Cửa bạn chọn đầu tiên đúng 1 lần trong 3, và không ai làm gì sau đó thay đổi được con số ấy.",
        "Nghĩa là 2 lần trong 3, xe nằm sau một trong hai cửa còn lại.",
        "Người dẫn không bao giờ mở cửa có xe, nên anh ta vừa chỉ ra trong hai cửa đó cái nào KHÔNG phải. Đổi cửa là ôm trọn 2/3 đó.",
      ],
      examples: [
        { ask: "Ba cánh cửa, một chiếc xe. Bạn chọn cửa 1. Người dẫn, vốn biết xe ở đâu, mở cửa 3 lộ ra con dê. Giữ hay đổi?",
          work: "Đổi. Giữ thì thắng 1/3, đúng bằng cơ hội cửa đầu tiên bạn chọn là đúng. Đổi thì ăn trọn 2/3 còn lại" },
        { ask: "Vẫn trò đó nhưng có 100 cửa: bạn chọn một cửa, người dẫn mở 98 cửa còn lại lộ ra toàn dê. Bạn có đổi không?",
          work: "Cửa đầu bạn chọn đúng 1 lần trong 100. Còn 99 lần kia xe nằm sau đúng cái cửa anh ta để lại, nên đổi thắng 99/100" },
      ],
      why: "Còn hai cửa thì cảm giác là năm ăn năm thua. Không phải, vì người dẫn không chọn ngẫu nhiên. Anh ta né chiếc xe, và chính cái né đó nói cho bạn biết xe ở đâu.",
    },
  },
  {
    id: "ruin-share-of-the-pot",
    skill: "prob.classics",
    en: {
      title: "In a fair game, your chance of winning it all is your share of the money",
      when: "Two players pass money back and forth on an even bet until one of them has none left.",
      steps: [
        "Each round is even, so neither player gains or loses anything on average.",
        "That leaves only one thing to decide the outcome: how much each of you started with.",
        "Your chance of taking everything is your pile divided by both piles together.",
      ],
      examples: [
        { ask: "You hold 3 coins and your opponent holds 2. Each round you flip a fair coin and the loser pays 1, until someone has none. What is the chance you take all five?",
          work: "Five coins on the table and three are yours → 3/5" },
        { ask: "Same fair game, but you hold 1 coin against their 9. What is your chance now?",
          work: "1 out of 10, so 1/10. The rounds are still fair; the pile is not" },
      ],
      why: "It looks like it needs you to add up every possible run of wins and losses, for ever. It does not. The starting piles settle it on their own.",
    },
    vi: {
      title: "Trong trò chơi công bằng, cơ hội ăn hết bằng đúng phần tiền bạn đang cầm",
      when: "Hai người chuyển tiền qua lại trong ván cược đều nhau, cho tới khi một người hết sạch.",
      steps: [
        "Mỗi ván đều nhau, nên không ai được hay mất gì tính trung bình.",
        "Vậy chỉ còn đúng một thứ quyết định kết cục: mỗi người bắt đầu với bao nhiêu.",
        "Cơ hội bạn ăn hết bằng đống tiền của bạn chia cho cả hai đống cộng lại.",
      ],
      examples: [
        { ask: "Bạn cầm 3 đồng, đối thủ cầm 2. Mỗi ván tung một đồng xu công bằng, người thua trả 1 đồng, tới khi một người hết sạch. Xác suất bạn ăn cả năm đồng?",
          work: "Năm đồng trên bàn, ba đồng là của bạn → 3/5" },
        { ask: "Vẫn ván cược công bằng đó, nhưng bạn cầm 1 đồng đấu 9 đồng của họ. Giờ cơ hội bao nhiêu?",
          work: "1 trên 10, tức 1/10. Từng ván vẫn công bằng; đống tiền thì không" },
      ],
      why: "Trông như phải cộng hết mọi chuỗi thắng thua có thể, đến vô tận. Không cần. Số tiền ban đầu tự nó định đoạt.",
    },
  },
  {
    id: "first-mover-one-equation",
    skill: "prob.classics",
    en: {
      title: "Going first? Write one line: you win now, or the game comes back to you",
      when: "Players take turns, and the first one to succeed wins.",
      steps: [
        "Call your chance of winning P, and your chance of succeeding on one turn p.",
        "Either you succeed straight away, or you miss and they miss too, and then it is your turn again with nothing changed, so your chance is P all over again.",
        "That is P = p + (1 − p)² × P. Solve it and P = 1/(2 − p).",
      ],
      examples: [
        { ask: "A and B take turns rolling a die. The first to roll a 6 wins, and A goes first. What is A's chance of winning?",
          work: "One turn succeeds with p = 1/6, so P = 1/(2 − 1/6) = 6/11 ≈ 0.545" },
        { ask: "Same game, but they flip a coin and the first to get heads wins. What is A's chance now?",
          work: "p = 1/2, so P = 1/(2 − 1/2) = 2/3. The easier it is to succeed, the more going first is worth" },
      ],
      why: "The honest route is to add up winning on turn 1, then turn 3, then turn 5, for ever. Noticing that the game returns to the exact same position replaces all of it with one equation you can solve in your head.",
    },
    vi: {
      title: "Đi trước? Viết một dòng: hoặc bạn thắng ngay, hoặc ván cờ quay lại chỗ bạn",
      when: "Hai người thay phiên nhau, ai thành công trước thì thắng.",
      steps: [
        "Gọi cơ hội thắng của bạn là P, và cơ hội thành công trong một lượt là p.",
        "Hoặc bạn thành công ngay, hoặc bạn trượt và đối thủ cũng trượt, rồi tới lượt bạn với mọi thứ y như cũ, nên cơ hội lại đúng là P.",
        "Vậy P = p + (1 − p)² × P. Giải ra được P = 1/(2 − p).",
      ],
      examples: [
        { ask: "A và B thay phiên tung xúc xắc. Ai ra mặt 6 trước thì thắng, và A đi trước. Xác suất A thắng là bao nhiêu?",
          work: "Một lượt thành công với p = 1/6, nên P = 1/(2 − 1/6) = 6/11 ≈ 0,545" },
        { ask: "Vẫn trò đó, nhưng họ tung xu và ai ra mặt ngửa trước thì thắng. Giờ cơ hội của A là bao nhiêu?",
          work: "p = 1/2, nên P = 1/(2 − 1/2) = 2/3. Càng dễ thành công thì đi trước càng có giá" },
      ],
      why: "Cách thật thà là cộng khả năng thắng ở lượt 1, rồi lượt 3, rồi lượt 5, mãi mãi. Nhận ra ván cờ quay về đúng vị trí cũ thay tất cả bằng một phương trình giải nhẩm được.",
    },
  },
  {
    id: "symmetry-orderings",
    skill: "prob.symmetry",
    en: {
      title: "If nothing distinguishes the positions, every ordering is equally likely",
      when: "The question is about order — largest, increasing, in what sequence — and nothing sets the items apart.",
      steps: [
        "n distinct continuous draws produce n! orderings, all equally likely.",
        "So the chance they come out in one named order is 1/n!.",
        "And the chance any particular one of them is the largest is 1/n.",
      ],
      examples: [
        { ask: "Five random numbers are drawn one after another. What is the chance they come out in decreasing order?",
          work: "Five values can arrive in 5! = 120 orders, all equally likely, and one of those is decreasing → 1/120" },
        { ask: "Three random numbers are drawn. What is the chance the second one is the biggest?",
          work: "Nothing marks out a position, so each of the three is equally likely to hold the biggest → 1/3" },
      ],
      why: "No integration, no counting. Ask whether the labels carry any information; usually they carry none.",
    },
    vi: {
      title: "Nếu không có gì phân biệt các vị trí thì mọi thứ tự đều đồng khả năng",
      when: "Đề hỏi về thứ tự — lớn nhất, tăng dần, ra theo trình tự nào — và không có gì phân biệt các phần tử.",
      steps: [
        "n lần rút liên tục khác nhau tạo ra n! thứ tự, tất cả đồng khả năng.",
        "Nên xác suất chúng ra theo đúng một thứ tự được nêu là 1/n!.",
        "Và xác suất một vị trí bất kỳ trong đó là lớn nhất là 1/n.",
      ],
      examples: [
        { ask: "Năm số ngẫu nhiên được lấy ra lần lượt. Xác suất chúng ra theo thứ tự giảm dần?",
          work: "Năm số có thể ra theo 5! = 120 thứ tự, tất cả đồng khả năng, và một trong số đó là giảm dần → 1/120" },
        { ask: "Ba số ngẫu nhiên được lấy ra. Xác suất số thứ hai là lớn nhất?",
          work: "Không có gì làm nổi bật một vị trí nào, nên cả ba đều có cơ hội giữ số lớn nhất như nhau → 1/3" },
      ],
      why: "Không tích phân, không đếm. Hãy hỏi các nhãn có mang thông tin gì không; thường là không.",
    },
  },
];

const BY_ID = new Map(TIPS.map((t) => [t.id, t]));
const BY_SKILL = TIPS.reduce((m, t) => {
  (m[t.skill] ||= []).push(t);
  return m;
}, {});

/** One tip card, already resolved to a language. Returns null for unknown ids. */
export function getTip(id, lang = "en") {
  const t = BY_ID.get(id);
  if (!t) return null;
  return { id: t.id, skill: t.skill, ...(t[lang] || t.en) };
}

/** Every tip attached to a skill, resolved to a language. */
export function tipsForSkill(skillId, lang = "en") {
  return (BY_SKILL[skillId] || []).map((t) => getTip(t.id, lang));
}
