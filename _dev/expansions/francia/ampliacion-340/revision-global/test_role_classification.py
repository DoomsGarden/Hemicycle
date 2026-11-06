import unittest
import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('decisions',Path(__file__).with_name('prepare-decisions.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class Roles(unittest.TestCase):
 def role(self,text,start='2020-01-01',end='2025-01-01'):
  return module.role_score({'roleFR':text,'start':start,'end':end})
 def test_prime_minister_retains_premier(self):
  self.assertEqual(self.role('Première ministre française')[1],'Jefatura del Gobierno')
  self.assertGreater(self.role('Premier ministre français')[0],self.role('Ministre des Armées')[0])
 def test_first_president_and_numbered_president(self):
  self.assertIn('fiscalización',self.role('Première présidente de la Cour des comptes')[1])
  self.assertIn('institución legislativa',self.role('1re présidente du Parlement européen')[1])
 def test_delegated_interior_is_not_primary_interior_minister(self):
  self.assertLess(self.role("Ministre auprès du ministre d'État, ministre de l'Intérieur")[0],self.role("Ministre de l'Intérieur")[0])
 def test_regional_delegate_does_not_become_regional_head(self):
  self.assertLess(self.role("Président délégué du conseil régional de Provence-Alpes-Côte-d'Azur")[0],self.role("Président du conseil régional de Provence-Alpes-Côte-d'Azur")[0])
 def test_group_vice_is_not_chamber_vice(self):
  self.assertLess(self.role("Vice-président du groupe RN à l'Assemblée nationale")[0],self.role("Deuxième vice-président de l'Assemblée nationale")[0])
 def test_joined_html_label_is_understood(self):
  self.assertIn('ejecutivo regional',self.role('Président du gouvernementde la Nouvelle-Calédonie')[1])
 def test_short_ministry_has_less_weight(self):
  self.assertLess(self.role("Ministre de l'Intérieur",'2025-01-01','2025-02-01')[0],self.role("Ministre de l'Intérieur")[0])
if __name__=='__main__':unittest.main()
