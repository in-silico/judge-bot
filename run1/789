#include<bits/stdc++.h>
using namespace std;

int main(int argc, char * argv[]) {
  string file1, file2, file3;
  file1 = argv[1];
  file2 = argv[2];
  file3 = argv[3];

  string command = "diff -wB " + file2 + " " + file3;
  int code = system(command.c_str());

  if (code != 0) return 1;
  return 0;
}
