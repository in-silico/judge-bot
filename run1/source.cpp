#include<bits/stdc++.h>
#include <unistd.h>
using namespace std;

int main() {
  int a, b;
  cin >> a >> b;
  int cnt = 0;
  vector<long long> v;
  for (int i = 0; i < 10000000 + 100000; ++i) {
    v.push_back(i);
  }

/*  vector<long long> vv = v;
  vector<long long> vvv = v;
  vector<long long> vvvv = v;
*/
  cout << a + b << endl;
  return 0;
}
