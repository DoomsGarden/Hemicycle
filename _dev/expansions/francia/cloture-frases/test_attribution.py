import unittest
from lxml import html
from attribution import speaker_marker,canonical_name,spoken_text,is_editorial_excerpt,is_session_date_heading
class AttributionRegression(unittest.TestCase):
 def marker(self,text):return speaker_marker(html.fromstring(text))
 def test_embedded_assembly_turn_without_dash(self):
  m=self.marker('<p>M. Jean-Claude RAUX (EcoS). Je ne conclurai pas sans dire un mot du SNU.</p>')
  self.assertEqual(canonical_name(m[0]),'jeanclauderaux')
 def test_commission_turn_with_dash(self):
  self.assertEqual(canonical_name(self.marker('<p>M. Pierre Laurent. - Je réponds.</p>')[0]),'pierrelaurent')
 def test_homonym_is_not_a_partial_match(self):
  self.assertNotEqual(canonical_name('M. Pierre-Laurent Simoni'),canonical_name('Pierre Laurent'))
 def test_reference_to_another_person_does_not_change_speaker(self):
  self.assertIsNone(self.marker('<p>M. Yung a évoqué la convergence des politiques entre Français et Allemands.</p>'))
 def test_address_to_another_person_does_not_change_speaker(self):
  self.assertIsNone(self.marker('<p>M. Vincent, vous mentionnez le comité de pilotage qui a rejeté la candidature de Saint-Etienne.</p>'))
 def test_office_followed_by_reported_speech_is_not_a_turn(self):
  self.assertIsNone(self.marker('<p>Mme Cynthia Ligeard, présidente du gouvernement de la Nouvelle-Calédonie, nous a décrit celui-ci comme une machine lente.</p>'))
 def test_real_label_with_office_without_dash_is_a_turn(self):
  self.assertEqual(canonical_name(self.marker('<p>M. Bernard Debré, député, rapporteur. Leur information médicale continue doit être développée.</p>')[0]),'bernarddebre')
 def test_session_heading_gives_date_of_hearing(self):
  self.assertTrue(is_session_date_heading('Mercredi 20 mars 2024'))
 def test_law_date_in_topic_does_not_replace_date_of_hearing(self):
  self.assertFalse(is_session_date_heading("Proposition de loi relative à la commission instituée par la loi du 4 août 2021 - Examen du rapport"))
 def test_named_press_question_has_its_own_speaker(self):
  self.assertEqual(canonical_name(self.marker('<p>Fabien VERSO<br>Vous ne dénoncez pas du coup…</p>')[0]),'fabienverso')
 def test_named_press_answer_is_separate(self):
  self.assertEqual(canonical_name(self.marker('<p>Sophie PRIMAS<br>Pardonnez-moi, je n\'ai pas ce détail.</p>')[0]),'sophieprimas')
 def test_an_institution_is_not_a_person_label(self):
  self.assertIsNone(self.marker('<p>La DGOS<br>intervient dans ce domaine.</p>'))
 def test_name_in_middle_of_paragraph_is_not_a_boundary(self):
  self.assertIsNone(self.marker('<p>Le rapport de <b>M. Jean Dupont</b> est cité ici.</p>'))
 def test_editorial_voting_result_is_not_a_spoken_phrase(self):
  p=html.fromstring('<p><em>La proposition de rédaction n’est pas adoptée.</em></p>')
  self.assertEqual(spoken_text(p),'')
 def test_applause_does_not_remove_the_actual_intervention(self):
  p=html.fromstring('<p>Nous continuerons. <i>(Applaudissements.)</i> Ensemble.</p>')
  self.assertEqual(spoken_text(p),'Nous continuerons. Ensemble.')
 def test_italic_loanword_remains_part_of_the_spoken_sentence(self):
  p=html.fromstring("<p>Je ne cherche pas à faire du <em>lobbying</em>.</p>")
  self.assertEqual(spoken_text(p),"Je ne cherche pas à faire du lobbying.")
  self.assertFalse(is_editorial_excerpt(p,"Je ne cherche pas à faire du lobbying."))
 def test_report_title_is_not_a_personal_quotation(self):
  p=html.fromstring('<p>Le titre retenu : <em>Une liberté garantie.</em></p>')
  self.assertTrue(is_editorial_excerpt(p,'Une liberté garantie.'))
if __name__=='__main__'  :unittest.main()
