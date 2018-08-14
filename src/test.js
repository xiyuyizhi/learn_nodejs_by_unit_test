let i = 0;

function print() {
  while (i < 10) {
    console.log(i);
    i++;
    if (i > 5) {
      return;
    }
  }
}

print();
