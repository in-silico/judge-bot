from random import randint as rd
n=10

for i in range(1, n + 1):
    f = open('in.' + str(i), 'w');
    a = rd(1, 100)
    b = rd(1, 100)
    f.write(str(a) + ' ' + str(b) + '\n')
    f.close()

    f2 = open('out.' + str(i), 'w');
    f2.write(str(a + b) + '\n')
    f2.close()


