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
 */

export const TIPS = [
  {
    id: "subtract-hundreds-first",
    skill: "arith.add-subtract",
    en: {
      title: "Subtract the hundreds first, then say the middle number out loud",
      steps: [
        "Take away the big part before the small part.",
        "Say the intermediate number to yourself. That is what stops you dropping a hundred.",
        "Then take away what is left.",
      ],
      example: "823 − 467 → 823 − 400 = 423 → 423 − 60 = 363 → 363 − 7 = 356",
      why: "Rounding up and adding back feels clever but loses a whole hundred when you are rushed. Going left to right never does.",
    },
    vi: {
      title: "Trừ hàng trăm trước, rồi đọc to số ở giữa",
      steps: [
        "Bỏ phần lớn trước, phần nhỏ sau.",
        "Đọc thầm số trung gian. Đó là thứ giữ cho bạn không rơi mất một trăm.",
        "Rồi trừ nốt phần còn lại.",
      ],
      example: "823 − 467 → 823 − 400 = 423 → 423 − 60 = 363 → 363 − 7 = 356",
      why: "Cách làm tròn lên rồi cộng bù nghe thông minh nhưng lúc vội rất hay mất nguyên một trăm. Đi từ trái sang phải thì không bao giờ.",
    },
  },
  {
    id: "split-and-add",
    skill: "arith.multiply",
    en: {
      title: "Split the second number, multiply twice, add",
      steps: [
        "Break the smaller factor into tens and units.",
        "Multiply each part separately.",
        "Add the two results.",
      ],
      example: "17 × 54 → 17 × 50 = 850, 17 × 4 = 68, 850 + 68 = 918",
      why: "Two easy multiplications beat one hard one. You are never holding more than three digits in your head.",
    },
    vi: {
      title: "Tách số thứ hai, nhân hai lần, rồi cộng",
      steps: [
        "Tách thừa số nhỏ hơn thành hàng chục và hàng đơn vị.",
        "Nhân từng phần riêng.",
        "Cộng hai kết quả lại.",
      ],
      example: "17 × 54 → 17 × 50 = 850, 17 × 4 = 68, 850 + 68 = 918",
      why: "Hai phép nhân dễ hơn một phép nhân khó. Bạn không bao giờ phải nhớ quá ba chữ số trong đầu.",
    },
  },
  {
    id: "times-five-and-eleven",
    skill: "arith.multiply",
    en: {
      title: "×5 is half of ×10. ×11 is the digits with their sum in the middle",
      steps: [
        "For ×5: multiply by 10, then halve.",
        "For ×11 on a two-digit number: keep the outer digits, put their sum between them.",
        "If that sum is 10 or more, carry the 1 into the first digit.",
      ],
      example: "48 × 5 → 480 ÷ 2 = 240.   36 × 11 → 3 (3+6) 6 = 396.   78 × 11 → 7 (15) 8 → 858",
      why: "Both turn a multiplication into an addition or a halving, which are far faster under a clock.",
    },
    vi: {
      title: "×5 là một nửa của ×10. ×11 là giữ hai đầu, đặt tổng vào giữa",
      steps: [
        "Với ×5: nhân 10 rồi chia đôi.",
        "Với ×11 số hai chữ số: giữ hai chữ số ngoài, đặt tổng của chúng vào giữa.",
        "Nếu tổng đó từ 10 trở lên thì nhớ 1 sang chữ số đầu.",
      ],
      example: "48 × 5 → 480 ÷ 2 = 240.   36 × 11 → 3 (3+6) 6 = 396.   78 × 11 → 7 (15) 8 → 858",
      why: "Cả hai biến phép nhân thành phép cộng hoặc chia đôi, nhanh hơn hẳn khi có đồng hồ.",
    },
  },
  {
    id: "squares-rule-of-one",
    skill: "arith.squares",
    en: {
      title: "Any square: slide to a round number, then add back",
      steps: [
        "n² = (n − d)(n + d) + d², where d slides n to something round.",
        "Choose d so one factor ends in 0.",
        "The correction d² is always small.",
      ],
      example: "37² → d = 3 → 34 × 40 = 1360 → +9 = 1369.   48² → d = 2 → 46 × 50 = 2300 → +4 = 2304",
      why: "It turns every square outside the memorised table into one easy multiplication by a multiple of ten.",
    },
    vi: {
      title: "Bình phương bất kỳ: trượt về số tròn, rồi cộng bù",
      steps: [
        "n² = (n − d)(n + d) + d², với d là khoảng trượt n về số tròn.",
        "Chọn d sao cho một thừa số kết thúc bằng 0.",
        "Phần bù d² luôn nhỏ.",
      ],
      example: "37² → d = 3 → 34 × 40 = 1360 → +9 = 1369.   48² → d = 2 → 46 × 50 = 2300 → +4 = 2304",
      why: "Nó biến mọi bình phương ngoài bảng đã thuộc thành một phép nhân dễ với bội của mười.",
    },
  },
  {
    id: "cube-root-last-digit",
    skill: "arith.roots",
    en: {
      title: "Cube roots: the last digit gives itself away",
      steps: [
        "A cube's last digit determines the root's last digit uniquely.",
        "0,1,4,5,6,9 map to themselves. Only 2↔8 and 3↔7 swap.",
        "Use the leading digits to find the tens: 5832 is between 10³ and 20³, so the root is 1_.",
      ],
      example: "∛5832 → ends in 2, so root ends in 8 → between 10 and 20 → 18",
      why: "You never divide anything. Two glances and the answer is forced.",
    },
    vi: {
      title: "Căn bậc ba: chữ số cuối tự khai ra",
      steps: [
        "Chữ số cuối của lập phương xác định duy nhất chữ số cuối của căn.",
        "0,1,4,5,6,9 giữ nguyên. Chỉ có 2↔8 và 3↔7 đổi chỗ.",
        "Dùng các chữ số đầu để tìm hàng chục: 5832 nằm giữa 10³ và 20³ nên căn là 1_.",
      ],
      example: "∛5832 → tận cùng 2, nên căn tận cùng 8 → nằm giữa 10 và 20 → 18",
      why: "Không phải chia gì cả. Nhìn hai lần là đáp án bị ép ra.",
    },
  },
  {
    id: "reduce-before-dividing",
    skill: "arith.divide",
    en: {
      title: "Cancel first, divide once",
      steps: [
        "Look for a common factor on both sides before doing any long division.",
        "Halve both numbers as often as they are both even.",
        "Then do the one division that is left.",
      ],
      example: "8 × 240 = 24 × ? → cancel 8 → 240 = 3 × ? → 80",
      why: "Most 4-digit-by-2-digit questions are built to cancel. Grinding through the division is the slow path the setter expects you to take.",
    },
    vi: {
      title: "Rút gọn trước, chia một lần",
      steps: [
        "Tìm thừa số chung hai vế trước khi làm phép chia dài.",
        "Chia đôi cả hai số chừng nào cả hai còn chẵn.",
        "Rồi làm nốt một phép chia còn lại.",
      ],
      example: "8 × 240 = 24 × ? → rút 8 → 240 = 3 × ? → 80",
      why: "Phần lớn câu chia 4 chữ số cho 2 chữ số được dựng để rút gọn được. Cắm đầu chia là con đường chậm mà người ra đề mong bạn đi.",
    },
  },
  {
    id: "fraction-anchors",
    skill: "arith.fractions",
    en: {
      title: "Learn eight anchors, read every percentage off them",
      steps: [
        "1/2 = 50%, 1/3 = 33.3%, 1/4 = 25%, 1/5 = 20%",
        "1/6 = 16.7%, 1/8 = 12.5%, 1/10 = 10%, 1/16 = 6.25%",
        "Everything else is an anchor plus or minus another anchor.",
      ],
      example: "3/8 = 25% + 12.5% = 37.5%.   5/6 = 100% − 16.7% = 83.3%",
      why: "Eight facts cover almost every fraction that appears. Deriving them each time costs seconds you do not have.",
    },
    vi: {
      title: "Thuộc tám cái mốc, mọi phần trăm khác đọc ra từ đó",
      steps: [
        "1/2 = 50%, 1/3 = 33,3%, 1/4 = 25%, 1/5 = 20%",
        "1/6 = 16,7%, 1/8 = 12,5%, 1/10 = 10%, 1/16 = 6,25%",
        "Mọi cái khác là một mốc cộng hoặc trừ một mốc khác.",
      ],
      example: "3/8 = 25% + 12,5% = 37,5%.   5/6 = 100% − 16,7% = 83,3%",
      why: "Tám con số phủ gần hết các phân số hay gặp. Tính lại từ đầu mỗi lần tốn đúng số giây bạn không có.",
    },
  },
  {
    id: "percent-flip",
    skill: "arith.percent",
    en: {
      title: "Percentages commute, so flip to the easy side",
      steps: ["x% of y is always equal to y% of x.", "Pick whichever of the two is easier to compute."],
      example: "18% of 50 is hard. 50% of 18 is 9.   4% of 75 → 75% of 4 = 3",
      why: "Free, exact, and it turns roughly a third of percentage questions into something you can say instantly.",
    },
    vi: {
      title: "Phần trăm đổi chỗ được, nên lật về phía dễ",
      steps: ["x% của y luôn bằng y% của x.", "Chọn cái nào trong hai cái dễ tính hơn."],
      example: "18% của 50 thì khó. 50% của 18 là 9.   4% của 75 → 75% của 4 = 3",
      why: "Miễn phí, chính xác, và biến khoảng một phần ba câu phần trăm thành thứ nói ra được ngay.",
    },
  },
  {
    id: "sequence-differences",
    skill: "seq.find-rule",
    en: {
      title: "Differences, then ratios, then look inside the digits",
      steps: [
        "Write the gaps between consecutive terms. Constant gap means arithmetic.",
        "Gaps growing steadily means quadratic; take the differences of the differences.",
        "Constant ratio means geometric. If neither works, check digit sums, or two sequences interleaved.",
      ],
      example: "3, 8, 17, 30, 47 → gaps 5, 9, 13, 17 → gaps of gaps 4, 4, 4 → quadratic",
      why: "This order finds the rule for four families out of five in under ten seconds, and tells you fast when to move on.",
    },
    vi: {
      title: "Xét hiệu, rồi tỉ số, rồi soi vào bên trong chữ số",
      steps: [
        "Viết khoảng cách giữa các số liền nhau. Hiệu không đổi là cấp số cộng.",
        "Hiệu tăng đều là bậc hai; lấy hiệu của hiệu.",
        "Tỉ số không đổi là cấp số nhân. Nếu đều không phải, xem tổng chữ số, hoặc hai dãy đan xen.",
      ],
      example: "3, 8, 17, 30, 47 → hiệu 5, 9, 13, 17 → hiệu của hiệu 4, 4, 4 → bậc hai",
      why: "Thứ tự này tìm ra quy luật của bốn trên năm họ trong chưa tới mười giây, và báo sớm khi nào nên bỏ qua.",
    },
  },
  {
    id: "odd-one-out-majority",
    skill: "seq.odd-one-out",
    en: {
      title: "Find the rule the majority obeys, then the outlier names itself",
      steps: [
        "Do not hunt for the odd term. Find the pattern that most terms fit.",
        "Use the first two or three terms to guess the rule; the first term is never the broken one.",
        "Walk forward and the first term that disagrees is the answer.",
      ],
      example: "2, 5, 11, 23, 46, 95 → doubling and adding 1 → 46 should be 47",
      why: "Staring at six numbers asking 'which looks wrong' has no method and no end. Fitting the majority does.",
    },
    vi: {
      title: "Tìm quy luật mà số đông tuân theo, kẻ lạc sẽ tự lộ",
      steps: [
        "Đừng đi săn số lệch. Hãy tìm quy luật mà phần lớn các số khớp.",
        "Dùng hai ba số đầu để đoán quy luật; số đầu tiên không bao giờ là số bị phá.",
        "Đi tới, số đầu tiên không khớp chính là đáp án.",
      ],
      example: "2, 5, 11, 23, 46, 95 → nhân đôi cộng 1 → 46 lẽ ra phải là 47",
      why: "Nhìn sáu con số rồi hỏi 'cái nào trông sai' thì không có phương pháp và không có điểm dừng. Khớp số đông thì có.",
    },
  },
  {
    id: "equally-likely",
    skill: "prob.counting",
    en: {
      title: "Count the outcomes, and keep them equally likely",
      steps: [
        "Write the sample space so every outcome has the same chance.",
        "Probability is then favourable divided by total.",
        "Two dice have 36 equally likely outcomes, not 11 sums.",
      ],
      example: "P(sum = 5) → (1,4)(2,3)(3,2)(4,1) → 4/36 = 1/9, not 1/11",
      why: "Almost every wrong answer in basic probability comes from counting a space whose outcomes are not equally likely.",
    },
    vi: {
      title: "Đếm các kết quả, và giữ cho chúng đồng khả năng",
      steps: [
        "Viết không gian mẫu sao cho mọi kết quả có cùng cơ hội.",
        "Xác suất khi đó là số thuận lợi chia tổng.",
        "Hai xúc xắc có 36 kết quả đồng khả năng, không phải 11 tổng.",
      ],
      example: "P(tổng = 5) → (1,4)(2,3)(3,2)(4,1) → 4/36 = 1/9, không phải 1/11",
      why: "Gần như mọi đáp án sai trong xác suất cơ bản đến từ việc đếm một không gian mà các kết quả không đồng khả năng.",
    },
  },
  {
    id: "at-least-one-complement",
    skill: "prob.counting",
    en: {
      title: "'At least one' means one minus 'none'",
      steps: [
        "Never add up the cases for one, two, three successes.",
        "Compute the probability of zero successes and subtract from 1.",
      ],
      example: "At least one 6 in 3 rolls → 1 − (5/6)³ = 1 − 125/216 = 91/216",
      why: "'None' is a single product. The direct sum is three or four terms and one of them is always miscounted.",
    },
    vi: {
      title: "'Ít nhất một' nghĩa là một trừ 'không có cái nào'",
      steps: [
        "Đừng cộng các trường hợp một, hai, ba lần thành công.",
        "Tính xác suất không thành công lần nào rồi lấy 1 trừ đi.",
      ],
      example: "Ít nhất một mặt 6 trong 3 lần tung → 1 − (5/6)³ = 1 − 125/216 = 91/216",
      why: "'Không có cái nào' chỉ là một phép nhân. Cộng trực tiếp thì ba bốn số hạng và luôn có một cái đếm sai.",
    },
  },
  {
    id: "expectation-is-a-weighted-average",
    skill: "prob.expected-value",
    en: {
      title: "Expected value is a weighted average, and it adds",
      steps: [
        "Multiply each payoff by its probability and add.",
        "E[X + Y] = E[X] + E[Y] always, even when X and Y are dependent.",
        "E[X × Y] = E[X] × E[Y] only when they are independent.",
      ],
      example: "One die: (1+2+3+4+5+6)/6 = 3.5. Two dice, sum: 3.5 + 3.5 = 7",
      why: "Adding expectations is the single most reusable move in the whole subject. It needs no independence and no case analysis.",
    },
    vi: {
      title: "Kỳ vọng là trung bình có trọng số, và nó cộng được",
      steps: [
        "Nhân mỗi khoản với xác suất của nó rồi cộng lại.",
        "E[X + Y] = E[X] + E[Y] luôn đúng, kể cả khi X và Y phụ thuộc nhau.",
        "E[X × Y] = E[X] × E[Y] chỉ đúng khi chúng độc lập.",
      ],
      example: "Một xúc xắc: (1+2+3+4+5+6)/6 = 3,5. Hai xúc xắc, tổng: 3,5 + 3,5 = 7",
      why: "Cộng kỳ vọng là nước đi dùng lại được nhiều nhất trong cả môn này. Không cần độc lập, không cần chia trường hợp.",
    },
  },
  {
    id: "expectation-not-one-path",
    skill: "prob.expected-value",
    en: {
      title: "The expected value is not the typical path",
      steps: [
        "For a product of independent factors, multiply the expectations.",
        "Up 10% then down 10% gives 0.99 of your money, but that is one path.",
        "The expectation of each day's factor is (1.1 + 0.9)/2 = 1.0, so the expected price never moves.",
      ],
      example: "100, ±10% daily, 2 days → E = 100 × 1.0 × 1.0 = 100, not 99",
      why: "This gap between the average outcome and the typical outcome is the whole reason volatility matters in finance. It is the most interviewed idea on this list.",
    },
    vi: {
      title: "Kỳ vọng không phải là đường đi điển hình",
      steps: [
        "Với tích các thừa số độc lập, hãy nhân các kỳ vọng.",
        "Tăng 10% rồi giảm 10% còn 0,99 số tiền, nhưng đó là một đường đi.",
        "Kỳ vọng của hệ số mỗi ngày là (1,1 + 0,9)/2 = 1,0, nên giá kỳ vọng không đổi.",
      ],
      example: "100, ±10% mỗi ngày, 2 ngày → E = 100 × 1,0 × 1,0 = 100, không phải 99",
      why: "Khoảng cách giữa kết quả trung bình và kết quả điển hình chính là lý do biến động quan trọng trong tài chính. Đây là ý được hỏi nhiều nhất trong danh sách này.",
    },
  },
  {
    id: "condition-shrinks-the-space",
    skill: "prob.conditional",
    en: {
      title: "Conditioning throws away outcomes, it does not merge them",
      steps: [
        "Write the full space, cross out what the condition rules out, recount.",
        "Two children are BB, BG, GB, GG. BG and GB are different outcomes.",
        "'At least one boy' leaves three, of which one is BB.",
      ],
      example: "P(both boys | at least one boy) = 1/3, but P(both boys | the elder is a boy) = 1/2",
      why: "The intuitive 1/2 is wrong because it silently merges BG and GB. Which fact you are told changes the answer, so read the wording twice.",
    },
    vi: {
      title: "Điều kiện loại bớt kết quả, chứ không gộp chúng lại",
      steps: [
        "Viết cả không gian, gạch đi phần điều kiện loại trừ, rồi đếm lại.",
        "Hai con là BB, BG, GB, GG. BG và GB là hai kết quả khác nhau.",
        "'Có ít nhất một con trai' còn lại ba, trong đó một là BB.",
      ],
      example: "P(cả hai trai | có ít nhất một trai) = 1/3, nhưng P(cả hai trai | con lớn là trai) = 1/2",
      why: "Trực giác 1/2 sai vì nó lặng lẽ gộp BG với GB. Bạn được cho biết điều gì sẽ đổi đáp án, nên đọc đề hai lần.",
    },
  },
  {
    id: "bayes-likelihood-share",
    skill: "prob.bayes",
    en: {
      title: "When every option was equally likely to begin with, Bayes is just a share",
      steps: [
        "For each option, ask how readily it would have produced the thing you actually saw.",
        "Add those numbers together.",
        "Your answer is your option's number divided by that total. The equal chance of picking each option sits on the top and the bottom, so it cancels and never needs writing down.",
      ],
      example: "Coins with P(heads) = 1/4, 1/2, 3/4, one flip lands heads → P(it was the 3/4 coin) = (3/4) ÷ (1/4 + 1/2 + 3/4) = 1/2",
      why: "It turns Bayes from a formula you half-remember into one division you can say out loud.",
    },
    vi: {
      title: "Khi mọi khả năng ban đầu đều dễ xảy ra như nhau, Bayes chỉ là chia phần",
      steps: [
        "Với mỗi khả năng, hỏi xem nó tạo ra đúng thứ bạn vừa thấy dễ dàng tới mức nào.",
        "Cộng các số đó lại.",
        "Đáp án là số của khả năng bạn đang hỏi chia cho tổng vừa cộng. Cơ hội chọn mỗi khả năng nằm cả ở tử lẫn mẫu nên nó triệt tiêu, khỏi cần viết ra.",
      ],
      example: "Ba xu P(ngửa) = 1/4, 1/2, 3/4, tung một lần ra ngửa → P(là xu 3/4) = (3/4) ÷ (1/4 + 1/2 + 3/4) = 1/2",
      why: "Nó biến Bayes từ một công thức nhớ mang máng thành một phép chia đọc ra miệng được.",
    },
  },
  {
    id: "waiting-time-one-over-p",
    skill: "prob.waiting-time",
    en: {
      title: "Waiting for something with probability p takes 1/p tries",
      steps: [
        "One 6 on a die: p = 1/6, so 6 rolls on average.",
        "Want it k times and they need not be consecutive? Just k/p, because expectations add.",
        "Consecutive is a different problem: a break sends you back to the start.",
      ],
      example: "Three 5s, not necessarily in a row → 3 × 6 = 18 rolls. But HH in a row → 6 flips, while HT → 4",
      why: "HT is 4 and HH is 6 because after a head, another head still keeps you waiting for the tail, but a tail resets the run of heads.",
    },
    vi: {
      title: "Chờ một biến cố có xác suất p thì mất 1/p lần thử",
      steps: [
        "Một mặt 6 trên xúc xắc: p = 1/6, nên trung bình 6 lần tung.",
        "Muốn nó xảy ra k lần và không cần liên tiếp? Chỉ là k/p, vì kỳ vọng cộng được.",
        "Liên tiếp lại là bài toán khác: đứt một cái là về lại từ đầu.",
      ],
      example: "Ba mặt 5, không cần liên tiếp → 3 × 6 = 18 lần. Nhưng HH liên tiếp → 6 lần, còn HT → 4",
      why: "HT là 4 còn HH là 6 vì sau một mặt ngửa, thêm một mặt ngửa nữa vẫn đang chờ mặt sấp, nhưng một mặt sấp thì xoá sạch chuỗi ngửa.",
    },
  },
  {
    id: "ruin-and-first-mover",
    skill: "prob.classics",
    en: {
      title: "Fair ruin is i/N, and going first is 1/(2 − p)",
      steps: [
        "In a fair game, your chance of reaching N before 0 from i is exactly i/N.",
        "Taking turns, first to succeed wins: P(first player) = p / (1 − (1 − p)²) = 1/(2 − p).",
        "The second form comes from one line: you win now, or both miss and the position repeats.",
      ],
      example: "3 coins against 2 → 3/5.   First to roll a 6 → 1/(2 − 1/6) = 6/11 ≈ 0.545",
      why: "Both look like they need infinite series and neither does. Setting up 'the position repeats' is the move worth practising.",
    },
    vi: {
      title: "Ruin công bằng là i/N, và đi trước là 1/(2 − p)",
      steps: [
        "Trong trò công bằng, xác suất từ i lên tới N trước khi về 0 đúng bằng i/N.",
        "Thay phiên nhau, ai thành công trước thì thắng: P(người đi trước) = p / (1 − (1 − p)²) = 1/(2 − p).",
        "Dạng thứ hai ra từ một dòng: hoặc bạn thắng ngay, hoặc cả hai trượt và ván cờ lặp lại.",
      ],
      example: "3 đồng đấu 2 đồng → 3/5.   Ai ra mặt 6 trước → 1/(2 − 1/6) = 6/11 ≈ 0,545",
      why: "Cả hai trông như cần chuỗi vô hạn mà thật ra không cần. Dựng được ý 'ván cờ lặp lại' mới là nước đáng luyện.",
    },
  },
  {
    id: "symmetry-orderings",
    skill: "prob.symmetry",
    en: {
      title: "If nothing distinguishes the positions, every ordering is equally likely",
      steps: [
        "n distinct continuous draws produce n! orderings, all equally likely.",
        "So the chance they come out in one named order is 1/n!.",
        "And the chance any particular one of them is the largest is 1/n.",
      ],
      example: "5 random numbers, strictly decreasing → 1/120.   3 draws, the 2nd is the largest → 1/3",
      why: "No integration, no counting. Ask whether the labels carry any information; usually they carry none.",
    },
    vi: {
      title: "Nếu không có gì phân biệt các vị trí thì mọi thứ tự đều đồng khả năng",
      steps: [
        "n lần rút liên tục khác nhau tạo ra n! thứ tự, tất cả đồng khả năng.",
        "Nên xác suất chúng ra theo đúng một thứ tự được nêu là 1/n!.",
        "Và xác suất một vị trí bất kỳ trong đó là lớn nhất là 1/n.",
      ],
      example: "5 số ngẫu nhiên, giảm dần ngặt → 1/120.   3 lần rút, cái thứ 2 lớn nhất → 1/3",
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
