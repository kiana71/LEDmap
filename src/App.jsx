const handlePrint = useReactToPrint({
  content: () => componentRef.current,
  pageStyle: `
    @page {
      size: letter;
      margin: 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
  `,
  removeAfterPrint: true
}); 