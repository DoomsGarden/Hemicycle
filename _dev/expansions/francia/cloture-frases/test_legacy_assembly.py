import unittest
from lxml import html
from legacy_assembly import legacy_turns

class LegacyAssembly(unittest.TestCase):
    def test_interruptions_end_the_previous_turn(self):
        root=html.fromstring('<div><p><b>M. Jean-Paul Garraud,</b><i>rapporteur.</i> Ma réponse.</p><p>Suite de ma réponse.</p><p><b>M. Patrick Roy.</b> Une interruption.</p><p>Suite de cette interruption.</p></div>')
        turns=list(legacy_turns(root))
        self.assertEqual([t[1]for t in turns],['jeanpaulgarraud','jeanpaulgarraud','patrickroy','patrickroy'])

    def test_chair_identity_changes_at_the_heading(self):
        root=html.fromstring('<div><h5 class="presidence">Présidence de M. Tony Dreyfus,</h5><h5 class="presidence">vice-président</h5><p><b>M. le président.</b> La séance est ouverte.</p><h5 class="presidence">Présidence de M. Bernard Accoyer,</h5><p><b>M. le président.</b> La séance est reprise.</p></div>')
        self.assertEqual([t[1]for t in legacy_turns(root)],['tonydreyfus','bernardaccoyer'])

    def test_unknown_chair_is_not_a_named_speaker(self):
        root=html.fromstring('<div><p><b>M. le président.</b> La séance est ouverte.</p></div>')
        self.assertIsNone(next(legacy_turns(root))[1])

if __name__ == '__main__':
    unittest.main()
