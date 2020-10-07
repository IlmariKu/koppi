md_file=$(basename ${1%.*})

pandoc \
    -s \
    -t beamer \
    --natbib \
    --bibliography=ref.bib \
    $md_file.md \
    -o $md_file.tex

pdflatex $md_file.tex
bibtex $md_file
pdflatex $md_file.tex
pdflatex $md_file.tex
