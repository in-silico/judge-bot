#include<bits/stdc++.h>
using namespace std;

int main(int argc, char * argv[]) {
  string file1, file2;
  file1 = argv[1];
  file2 = argv[2];

  string command = "diff -wB " + file1 + " " + file2;
  int verdict = system(command.c_str());
  return verdict;
  /*ifstream f1(file1), f2(file2);

  string word1, word2;
  while (f1 >> word1 && f2 >> word2) {
    cout << word1 << " " << word2 << endl;
  }
*/
  return 0;
}
